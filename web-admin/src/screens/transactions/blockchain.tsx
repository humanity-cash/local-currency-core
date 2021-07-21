import { TableTemplate } from 'components';
import { useBlockchainData } from 'hooks';
import { BlockchainDataState } from 'types';

interface Column {
  id: 'from' | 'to' | 'amount' | 'status' | 'time';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const columns: Column[] = [
  { id: 'from', label: 'From', minWidth: 100 },
  { id: 'to', label: 'To', minWidth: 100 },
  {
    id: 'amount',
    label: 'Amount',
    minWidth: 100,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    align: 'right',
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'time',
    label: 'Time',
    minWidth: 100,
    align: 'right',
    format: (value: number) => value.toFixed(2),
  },
];


const BlockchainDataTable = () => {
	const state: BlockchainDataState = useBlockchainData();

  return (
		<TableTemplate data={state.data} columns={columns} />
 );
}

export default BlockchainDataTable;