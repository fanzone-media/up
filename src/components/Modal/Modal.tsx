import React from "react";
import { StyledCloseModalButton, StyledModalContainer, StyledModalHeader, StyledModalHeading } from "./styles";

interface IProps {
    onClose: () => void;
    heading: string;
    children: JSX.Element;
};

export const Modal: React.FC<IProps> = ({onClose, heading, children}: IProps) => {
    return (
        <StyledModalContainer>
            <StyledModalHeader>
                <StyledModalHeading>
                    {heading}
                </StyledModalHeading>
                <StyledCloseModalButton onClick={onClose}>
                    close
                </StyledCloseModalButton>
            </StyledModalHeader>
            {children}
        </StyledModalContainer>
    );
};