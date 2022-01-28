import React from 'react';
//import { checkNameAvailabity, setVanityName } from "../../services/controllers/LNS";
import { StyledCreateName } from './styles';

export const CreateName: React.FC = () => {
  // const [error, setError] = useState<string>('');
  // const checkName = async () => {
  //     const res = await checkNameAvailabity("claudio");
  //     console.log(res);
  // }
  // const setName = async () => {
  //     await setVanityName("claudio", "0x6166ED6bf03ccBC9c8AD7b1C8EBf42B835e86082").catch((error) => {
  //         setError(error.message);
  //         console.error(error);
  //     });
  // }
  return (
    <StyledCreateName>
      {/* <StyledForm>
                <StyledInput placeholder="name"/>
                <StyledCheckAvailabilityButton onClick={checkName}>
                    Check availability
                </StyledCheckAvailabilityButton>
                <StyledInput placeholder="address"/>
                {error && (
                    <StyledError>{error}</StyledError>
                )}
                <StyledConfirmButton onClick={setName}>Get Name</StyledConfirmButton>
            </StyledForm> */}
    </StyledCreateName>
  );
};
