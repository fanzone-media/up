import { ErrorIcon, PendingIcon, SuccessIcon } from '../../assets';
import { STATUS } from '../../utility';
import { StyledModalButton } from '../Modal/styles';
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
    };
    failed: {
      mainHeading: string;
      description?: string;
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
            {callback && state === STATUS.FAILED && (
              <StyledTryButton onClick={callback}>Try again</StyledTryButton>
            )}
          </StyledStateContent>
        </StyledProcessingWindow>
      )}
    </>
  );
};
