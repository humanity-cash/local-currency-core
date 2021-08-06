import { TableTemplate } from 'components';
import { useACHData } from 'hooks';
import moment from 'moment';
import { ACHData, ACHDataState } from 'types';

interface Column {
  id: keyof ACHData
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: any) => any;
}

const columns: Column[] = [
  { id: 'bank', label: 'Bank', minWidth: 100 },
  { id: 'username', label: 'User', minWidth: 100 },
  { id: 'type', label: 'Type', minWidth: 100 },
  { id: 'createdAt', label: 'Created At', minWidth: 100, format: (value: number) => moment().format() },
  { id: 'confirmedAt', label: 'Confirmed At', minWidth: 100, format: (value: number) => moment().format()},
  {
    id: 'amount',
    label: 'Amount',
    minWidth: 100,
    format: (value: number) => value.toLocaleString('en-US') + ' $',
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    format: (value: number) => value,
  },
];


const ACHDataTable = () => {
	const state: ACHDataState = useACHData();

  return (
		<TableTemplate data={state.data} columns={columns} />
 );
}

export default ACHDataTable;