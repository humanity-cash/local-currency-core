import { FilterTable } from 'components';
import { useBlockchainData } from 'hooks';
import moment from 'moment';
import { useHistory } from 'react-router-dom';
import { BlockchainData, BlockchainDataState } from 'types';

interface Column {
  name: keyof BlockchainData;
  title: string;
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
			name: 'transactionHash',
			title: 'Hash',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/transaction/bc/${value}`),
		},
		{
			name: 'fromUser',
			title: 'From',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/user/${value}`),
		},
		{
			name: 'toUser',
			title: 'To',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => history.push(`/user/${value}`),
		},
		{
			name: 'from',
			title: 'From Address',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => console.log('clicked'),
		},
		{
			name: 'to',
			title: 'To Address',
			minWidth: 100,
			clickable: true,
			onClick: (value: string) => console.log('clicked'),
		},
		{
			name: 'type',
			title: 'Type',
			minWidth: 100,
			format: (value: string) => value,
		},
		{
			name: 'amount',
			title: 'Amount',
			minWidth: 100,
			format: (value: number) => 'B$ ' + value,
		},
		{
			name: 'createdAt',
			title: 'Created At',
			minWidth: 100,
			format: (value: number) => moment().format(),
		},
		{
			name: 'blocksConfirmed',
			title: 'Blocks Confirmed',
			minWidth: 100,
			format: (value: number) => value
		},
	];

	return columns;
};


const BlockchainDataTable = () => {
	const columns: Column[] = useColumns();
	const state: BlockchainDataState = useBlockchainData();

  return (
		<div style={{paddingLeft: '19em', paddingTop: '2em',  paddingRight: '2em'}}>
			<FilterTable rows={state.data} columns={columns} />
		</div>
  );
}

export default BlockchainDataTable;