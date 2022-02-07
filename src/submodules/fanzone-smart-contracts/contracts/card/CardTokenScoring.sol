// SPDX-License-Identifier: CC0-1.0

pragma solidity ^0.8.0;

// modules
import "../libraries/ABDKMathQuad.sol";

/**
 * @dev Logic required for providing a score for a card
 */
abstract contract CardTokenScoring {
    /**
     * @dev Implemention for all Fanzone card scores. Expected not to be used in transactions as it
     * costs additional gas to do floating point math.
     */
    function calculateScore(
        uint256 tokenSupply,
        uint256 scoreMin,
        uint256 scoreMax,
        uint256 scoreScale,
        uint256 scoreMaxTokenId,
        uint256 tokenId
    ) internal pure returns (string memory) {
        // setup
        bytes16 tenQuad;
        bytes16 oneTenthQuad;
        bytes16 tokenSupplyDiv10Quad;
        bytes16 scoreMinScaledQuad;
        bytes16 scoreMaxScaledQuad;
        // we want 2 decimal places rounded up, so we need a scale with 3 additional digits
        uint256 resultScale = 1000;
        {
            // constants
            bytes16 oneQuad = ABDKMathQuad.fromUInt(1);
            tenQuad = ABDKMathQuad.fromUInt(10);
            oneTenthQuad = ABDKMathQuad.div(oneQuad, tenQuad);

            // value used in multiple steps of formula
            tokenSupplyDiv10Quad = ABDKMathQuad.div(
                ABDKMathQuad.fromUInt(tokenSupply),
                tenQuad
            );

            // scale the score values
            bytes16 scoreScaleQuad = ABDKMathQuad.fromUInt(scoreScale);
            scoreMaxScaledQuad = ABDKMathQuad.div(
                ABDKMathQuad.fromUInt(scoreMax),
                scoreScaleQuad
            );
            scoreMinScaledQuad = ABDKMathQuad.div(
                ABDKMathQuad.fromUInt(scoreMin),
                scoreScaleQuad
            );
        }

        // cards are only scored up to a max tokenId; for tokenIds outside this range the min score
        // is the static value
        if (tokenId > scoreMaxTokenId) {
            uint256 scoreMinResultScaled = ABDKMathQuad.toUInt(
                ABDKMathQuad.mul(
                    scoreMinScaledQuad,
                    ABDKMathQuad.fromUInt(resultScale)
                )
            );
            return buildDecimalString(scoreMinResultScaled, resultScale);
        }

        // compute x1 & x2 part
        bytes16 x1x2Quad;
        {
            bytes16 x1Quad = ABDKMathQuad.sub(
                scoreMaxScaledQuad,
                scoreMinScaledQuad
            );
            bytes16 x2Quad = ABDKMathQuad.mul(
                tokenSupplyDiv10Quad,
                tokenSupplyDiv10Quad
            );

            x1x2Quad = ABDKMathQuad.div(x1Quad, x2Quad);
        }

        // compute x3 & x4 part
        bytes16 x3x4Quad;
        {
            bytes16 tokenIdQuad = ABDKMathQuad.fromUInt(tokenId);

            bytes16 x3Quad = ABDKMathQuad.sub(
                ABDKMathQuad.div(tokenIdQuad, tenQuad),
                oneTenthQuad
            );
            bytes16 x4Quad = tokenSupplyDiv10Quad;
            bytes16 x3x4StepQuad = ABDKMathQuad.sub(x3Quad, x4Quad);

            x3x4Quad = ABDKMathQuad.mul(x3x4StepQuad, x3x4StepQuad);
        }

        // compute final x
        bytes16 xFinalQuad;
        {
            bytes16 x5Quad = scoreMinScaledQuad;

            xFinalQuad = ABDKMathQuad.add(
                ABDKMathQuad.mul(x1x2Quad, x3x4Quad),
                x5Quad
            );
        }

        uint256 xFinalResultScaled = ABDKMathQuad.toUInt(
            ABDKMathQuad.mul(xFinalQuad, ABDKMathQuad.fromUInt(resultScale))
        );

        return buildDecimalString(xFinalResultScaled, resultScale);
    }

    /**
     * @dev Helper function that will round up `x` then create a decimal string using `scale` to
     * "split" the rounded value into the integer and fractional parts.
     *
     * NOTE: `scale` should be one power of 10 larger than desired number of digits in the
     * fractional part to account for rounding up. For two digits in the fractional part, `scale`
     * should be `1000`.
     *
     * ie. x = 12345, scale = 1000, result = '12.35'
     */
    function buildDecimalString(uint256 x, uint256 scale)
        internal
        pure
        returns (string memory)
    {
        // last digit is used to round the number up
        uint256 xRounded = x + 5;

        uint256 lhs = xRounded / (scale);
        // we throw away last digit by dividing by 10
        uint256 rhs = ((xRounded - (lhs * scale))) / 10;

        return
            string(
                abi.encodePacked(
                    uintToString(lhs, false),
                    ".",
                    uintToString(rhs, true)
                )
            );
    }

    /**
     * @dev Helper function to convert a uint into a string.
     */
    function uintToString(uint256 x, bool isFractionalPart)
        internal
        pure
        returns (string memory uintAsString)
    {
        if (x == 0) {
            if (isFractionalPart) {
                // fractional part should always have 2 digits
                return "00";
            } else {
                return "0";
            }
        }

        // determine size of bytes array to encode number
        uint256 length;
        {
            uint256 xTemp = x;
            while (xTemp != 0) {
                length++;
                xTemp /= 10;
            }
        }

        bytes memory byteString;
        if (isFractionalPart && length == 1) {
            // fractional part should always have 2 digits, need to add the leading zero when the
            // `rhs` value is one digit
            // (ie. when `rhs` value is 2 return '02')
            length = 2;
            byteString = new bytes(length);
            byteString[0] = bytes1(uint8(48));
        } else {
            byteString = new bytes(length);
        }

        {
            uint256 i = length;
            while (x != 0) {
                i = i - 1;
                uint8 temp = (48 + uint8(x - (x / 10) * 10));
                bytes1 b1 = bytes1(temp);
                byteString[i] = b1;
                x /= 10;
            }
        }

        return string(byteString);
    }
}
