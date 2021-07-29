import { TableTemplate } from 'components';
import { useBlockchainData } from 'hooks';
import moment from 'moment';
import { BlockchainData, BlockchainDataState } from 'types';

interface Column {
  id: keyof BlockchainData;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: any) => string;
}

const columns: Column[] = [
  { id: 'fromEmail', label: 'From User', minWidth: 100 },
  { id: 'toEmail', label: 'To User', minWidth: 100 },
  { id: 'from', label: 'From Address', minWidth: 100 },
  { id: 'to', label: 'To Address', minWidth: 100 },
  { id: 'isToMerchant', label: 'Purchase', minWidth: 100, format: (value: boolean) => value ? 'Yes' : 'No' },
  {
    id: 'amount',
    label: 'Amount',
    minWidth: 100,
    format: (value: number) => value.toLocaleString('en-US'),
  },
  {
    id: 'createdAt',
    label: 'Created At',
    minWidth: 100,
    format: (value: number) => moment().format(),
  },
  {
    id: 'confirmedAt',
    label: 'Confirmed At',
    minWidth: 100,
    format: (value: number) => moment().format(),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    format: (value: number) => value.toLocaleString('en-US'),
  },
];


const BlockchainDataTable = () => {
	const state: BlockchainDataState = useBlockchainData();

  return (
		<TableTemplate data={state.data} columns={columns} />
 );
}

export default BlockchainDataTable;