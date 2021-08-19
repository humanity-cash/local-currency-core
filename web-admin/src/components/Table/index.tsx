import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { ChangeEvent, useState } from 'react';

const useStyles = makeStyles({
  root: {
    width: '100%',
		gridColumn: '2/7',
		gridRow: '1/2'
  },
  container: {
    maxHeight: 540,
  },
	wrapper: {
		padding: '24px',
		paddingLeft: '0',
		display: 'grid',
		gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
		gridTemplateRows: '1fr 1fr 1fr',
		height: '90vh'
	}
});

interface TableHeaderProps {
	columns: any[],
}

const TableHeader = (props: TableHeaderProps) => {
	const { columns } = props;

	return (
		<TableHead>
			<TableRow>
				{columns?.map((column) => (
					<TableCell
						key={column.id}
						align={column.align}
						style={{ minWidth: column.minWidth, fontSize: '18px' }}
					>
						{column.label}
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
}

interface TableProps {
	data: any[],
	columns: any[]
};

const TableTemplate = (props: TableProps) => {
	const { data, columns } = props;
  const classes = useStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
	<div className={classes.wrapper}>
    <Paper className={classes.root}>
      <TablePagination
        rowsPerPageOptions={[10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
				<TableHeader columns={columns} />
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => {
              return (
					<TableRow
						hover
						role='checkbox'
						tabIndex={-1}
						key={row.address}
						style={{
							backgroundColor:
								idx % 2 === 0 ? '#eef0f2' : 'white',
						}}>
						{columns.map((column) => {
							const value = row[column.id];
							return (
								<TableCell
									style={{
										cursor: column.clickable
											? 'pointer'
											: 'default',
										fontSize: '16px',
										color: column.clickable
											? 'blue'
											: 'black',
										textDecoration: column.clickable
											? 'underline'
											: 'none',
									}}
									key={column.id}
									align={column.align}
									onClick={() => {
										return column.clickable
											? column.onClick(value)
											: null;
									}}>
									{column.format
										? column.format(value)
										: value}
								</TableCell>
							);
						})}
					</TableRow>
				);
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
	</div> 
 );
}

export default TableTemplate;