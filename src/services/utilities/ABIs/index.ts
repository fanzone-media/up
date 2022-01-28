import { LSP3AccountABI } from './LSP3AccountABI';
import { FactoryContractABI } from './FactoryContractABI';
import LSP4DigitalCertificateABI from './LSP4DigitalCertificateABI';
import { UniversalReceiverABI } from './UniversalReceiverABI';
import { LnsABI } from './LnsABI';
import { ContractInterface } from 'ethers';

export default Object.freeze({
  LSP3AccountABI: LSP3AccountABI,
  LSP4DigitalCertificateABI: LSP4DigitalCertificateABI,
  FactoryContractABI: FactoryContractABI,
  UniversalReceiverABI: UniversalReceiverABI,
  LnsABI: LnsABI,
}) as { [key: string]: ContractInterface };
