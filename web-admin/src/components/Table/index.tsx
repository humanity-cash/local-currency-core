import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import React from 'react';

const useStyles = makeStyles({
  root: {
    width: '100%',
		gridColumn: '2/5',
		gridRow: '1/2'
  },
  container: {
    maxHeight: 440,
  },
	wrapper: {
		padding: '24px',
		display: 'grid',
		gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
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
						style={{ minWidth: column.minWidth }}
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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
	<div className={classes.wrapper}>
    <Paper className={classes.root}>
      <TableContainer className={classes.container}>
        <Table stickyHeader aria-label="sticky table">
				<TableHeader columns={columns} />
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              return (
                <TableRow hover role="checkbox" tabIndex={-1} key={row.address}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {column.format && typeof value === 'number' ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
	</div> 
 );
}

export default TableTemplate;