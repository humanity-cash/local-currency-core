import { TableTemplate } from 'components';
import { useACHData } from 'hooks';
import { ACHDataState } from 'types';

interface Column {
  id: 'user' | 'type' | 'time' | 'amount' | 'bank' | 'status';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: 'user', label: 'User', minWidth: 100 },
  { id: 'type', label: 'Type', minWidth: 100 },
  { id: 'time', label: 'Time', minWidth: 100 },
  {
    id: 'amount',
    label: 'Amount',
    minWidth: 100,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'bank',
    label: 'Bank',
    minWidth: 100,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    align: 'right',
    format: (value: number) => value.toFixed(2),
  },
];


const ACHDataTable = () => {
	const state: ACHDataState = useACHData();

  return (
		<TableTemplate data={state.data} columns={columns} />
 );
}

export default ACHDataTable;