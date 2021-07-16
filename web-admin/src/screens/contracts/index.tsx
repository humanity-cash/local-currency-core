import { TableTemplate } from 'components';
import { useContractsState } from 'hooks';
import { ContractsState } from 'types';

interface Column {
  id: 'name' | 'address' | 'deployedAt' | 'status' | 'actions';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'address', label: 'Address', minWidth: 100 },
  {
    id: 'deployedAt',
    label: 'Deployed At',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'actions',
    label: 'Actions',
    minWidth: 170,
    align: 'right',
    format: (value: number) => value.toFixed(2),
  },
];


const ContractsTable = () => {
	const state: ContractsState = useContractsState();

  return (
		<TableTemplate data={state.data} columns={columns} />
 );
}

export default ContractsTable;