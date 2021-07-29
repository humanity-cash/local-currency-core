import StopIcon from '@material-ui/icons/HighlightOffTwoTone';
import StartIcon from '@material-ui/icons/PlayCircleFilledWhiteTwoTone';
import { TableTemplate } from 'components';
import { useContractsState } from 'hooks';
import moment from 'moment';
import { ContractData, ContractsState } from 'types';

interface Column {
  id: keyof ContractData; 
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => any;
}

const Actions = () => {

  return (
    <>
      <div style={{cursor: 'pointer'}}>
        <StartIcon />
      </div>
      <div style={{cursor: 'pointer'}}>
        <StopIcon />
      </div>
    </>
  );
};

const columns: Column[] = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'version', label: 'Version', minWidth: 170 },
  { id: 'address', label: 'Address', minWidth: 100 },
  {
    id: 'deployedAt',
    label: 'Deployed At',
    minWidth: 170,
    format: (value: number) =>  moment().format(),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 170,
    format: (value: number) =>  value ? 'UP' : 'DOWN'
  },
  {
    id: 'address',
    label: 'Actions',
    minWidth: 170,
    format: (value: number) => <Actions/>
  },
];


const ContractsTable = () => {
	const state: ContractsState = useContractsState();

  return (
		<TableTemplate data={state.data} columns={columns} />
 );
}

export default ContractsTable;