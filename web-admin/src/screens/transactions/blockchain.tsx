import { TableTemplate } from 'components';
import { useBlockchainData } from 'hooks';
import moment from 'moment';
import { BlockchainData, BlockchainDataState } from 'types';
import { iconStatus } from 'utils';

interface Column {
  id: keyof BlockchainData;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: any) => any;
}

const columns: Column[] = [
  { id: 'transactionHash', label: 'Hash', minWidth: 100 },
  { id: 'fromUser', label: 'From', minWidth: 100 },
  { id: 'toUser', label: 'To', minWidth: 100 },
  { id: 'isToMerchant', label: 'Purchase', minWidth: 100, format: (value: boolean) => value ? 'Yes' : 'No' },
  {
    id: 'amount',
    label: 'Amount',
    minWidth: 100,
    format: (value: number) => value.toLocaleString('en-US') + ' B$',
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
    format: (value: string) => iconStatus(value)
  },
];


const BlockchainDataTable = () => {
	const state: BlockchainDataState = useBlockchainData();

  return (
		<TableTemplate data={state.data} columns={columns} />
 );
}

export default BlockchainDataTable;