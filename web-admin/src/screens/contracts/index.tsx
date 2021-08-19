import PausePresentationTwoToneIcon from '@material-ui/icons/PausePresentationTwoTone';
import { TableTemplate } from 'components';
import { useContractsState } from 'hooks';
import moment from 'moment';
import { useStore } from 'react-hookstore';
import { MODAL_STORE } from 'store';
import { ContractData, ContractsState, ModalState } from 'types';

interface Column {
  id: keyof ContractData; 
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: any) => any;
}

const Actions = () => {
  const [, setModalState]: [ModalState, any] = useStore(MODAL_STORE);

  return (
		<div style={{ display: 'inline-flex' }}>
			<div style={{ cursor: 'pointer' }} onClick={() => setModalState({isOpen: true, type: 'TEST_MODAL'})}>
				<PausePresentationTwoToneIcon />
			</div>
		</div>
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
    format: (value: number) =>  value === undefined ? '' : value === 1 ? 'ACTIVE' : 'DISABLED'
  },
  {
    id: 'name',
    label: 'Actions',
    minWidth: 170,
    format: (value: string) => value === 'Controller' ? <Actions /> : null
  },
];


const ContractsTable = () => {
	const state: ContractsState = useContractsState();

  return (
		<TableTemplate data={state.data} columns={columns} />
 );
}

export default ContractsTable;