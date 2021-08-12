import { TableTemplate } from 'components';
import { useBlockchainData } from 'hooks';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { BlockchainData, BlockchainDataState } from 'types';
import { iconStatus } from 'utils';

interface Column {
  id: keyof BlockchainData;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: any) => any;
  onClick?: (value: any) => any;
  clickable?: boolean;
}

const useColumns = () => {
	const history = useHistory();
	const columns: Column[] = [
		{
			id: 'transactionHash',
			label: 'Hash',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/transaction/bc/${value}`),
		},
		{
			id: 'fromUser',
			label: 'From',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/user/${value}`),
		},
		{
			id: 'toUser',
			label: 'To',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/user/${value}`),
		},
		{
			id: 'isToMerchant',
			label: 'Purchase',
			minWidth: 100,
			format: (value: boolean) => (value ? 'Yes' : 'No'),
		},
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
			format: (value: string) => iconStatus(value),
		},
	];

	return columns;
};


const BlockchainDataTable = () => {
	const columns: Column[] = useColumns();
	const state: BlockchainDataState = useBlockchainData();

  return (
		<TableTemplate data={state.data} columns={columns} />
 );
}

export default BlockchainDataTable;