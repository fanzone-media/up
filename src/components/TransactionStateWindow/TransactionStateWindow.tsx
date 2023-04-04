import { ErrorIcon, PendingIcon, SuccessIcon } from '../../assets';
import { STATUS } from '../../utility';
import {
  StyledProcessingWindow,
  StyledStateContent,
  StyledStateDescription,
  StyledStateHeading,
  StyledStateIcon,
  StyledTryButton,
} from './styles';

interface IProps {
  state: STATUS;
  height?: 'full';
  callback?: () => any;
  transactionMessages: {
    loading: {
      mainHeading: string;
      description?: string;
    };
    successful: {
      mainHeading: string;
      description?: string;
      callback?: () => any;
    };
    failed: {
      mainHeading: string;
      description?: string;
      callback?: () => any;
    };
  };
}

export const TransactionStateWindow = ({
  state,
  height,
  transactionMessages,
  callback,
}: IProps) => {
  const transactionStatesIcons = {
    loading: {
      icon: PendingIcon,
    },
    successful: {
      icon: SuccessIcon,
    },
    failed: {
      icon: ErrorIcon,
    },
  };
  return (
    <>
      {state !== STATUS.IDLE && (
        <StyledProcessingWindow height={height}>
          <StyledStateContent>
            <StyledStateIcon src={transactionStatesIcons[state].icon} alt="" />
            <StyledStateHeading>
              {transactionMessages[state].mainHeading}
            </StyledStateHeading>
            <StyledStateDescription>
              {transactionMessages[state]?.description}
            </StyledStateDescription>
            {state === STATUS.SUCCESSFUL &&
              transactionMessages[state]?.callback && (
                <StyledTryButton onClick={transactionMessages[state].callback}>
                  Proceed
                </StyledTryButton>
              )}
            {state === STATUS.FAILED &&
              transactionMessages[state] &&
              transactionMessages[state]?.callback && (
                <StyledTryButton onClick={transactionMessages[state].callback}>
                  Try again
                </StyledTryButton>
              )}
          </StyledStateContent>
        </StyledProcessingWindow>
      )}
    </>
  );
};
