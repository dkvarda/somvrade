import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Paper,
  TableRow,
  makeStyles,
  TableHead,
  IconButton,
  Divider,
  TablePagination,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
import DeleteIcon from '@material-ui/icons/Delete';
import AcceptIcon from '@material-ui/icons/Check';
import EditIcon from '@material-ui/icons/Edit';
import { EditDialog } from './EditDialog';
import {
  useCollectionPoints,
  CollectionPointEntity,
  approveCollectionPoint,
  deleteCollectionPoint,
} from '../../services';
import { Session, useSession } from '../../Session';

const useStyles = makeStyles({
  table: {
    width: '100%',
  },
  rowActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

type CollectionPointsProps = {
  onlyWaiting: boolean
}

export function CollectionPoints(props: CollectionPointsProps) {
  const classes = useStyles();
  const [session] = useSession();
  const [editingEntity, setEditingEntity] = useState<CollectionPointEntity>();
  let { isLoading, response, error, refresh } = useCollectionPoints(props.onlyWaiting);

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <TableContainer component={Paper}>
        {isLoading && <LinearProgress />}
        {error && <Alert severity={'error'}>{JSON.stringify(error)}</Alert>}
        <Table className={classes.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Okres</TableCell>
              <TableCell>Mesto/Obec</TableCell>
              <TableCell>Okrsok</TableCell>
              <TableCell>Názov odbérneho miesta</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Možnosti</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(response || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
              <Row
                key={row.id}
                entity={row}
                session={session}
                onActionDone={refresh}
                handleEdit={entity => setEditingEntity(entity)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100, 200]}
        component="div"
        count={(response || []).length}
        rowsPerPage={rowsPerPage}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />
      <EditDialog
        entity={editingEntity}
        onCancel={() => setEditingEntity(undefined)}
        onConfirm={() => {
          setEditingEntity(undefined);
          refresh();
        }}
      />
    </>
  );
}

function Row({
  entity,
  session,
  onActionDone,
  handleEdit,
}: {
  entity: CollectionPointEntity;
  session: Session;
  onActionDone: () => void;
  handleEdit: (entity: CollectionPointEntity) => void;
}) {
  const classes = useStyles();
  const [actionLoading, setActionLoading] = useState(false);

  async function handleDelete(entity: CollectionPointEntity) {
    setActionLoading(true);
    try {
      await deleteCollectionPoint(entity.id, session);
      onActionDone();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove(entity: CollectionPointEntity) {
    setActionLoading(true);
    try {
      await approveCollectionPoint(entity, session);
      onActionDone();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <TableRow key={entity.id}>
      <TableCell component="th" scope="row">
        {entity.county}
      </TableCell>
      <TableCell component="th" scope="row">
        {entity.city}
      </TableCell>
      <TableCell component="th" scope="row">
        {entity.district}
      </TableCell>
      <TableCell component="th" scope="row">
        {entity.address}
      </TableCell>
      <TableCell component="th" scope="row">
        {entity.active ? 'Aktívne' : 'Neaktívne'}
      </TableCell>
      <TableCell component="th" scope="row" align="right">
        {actionLoading && <CircularProgress size={25} />}
        {!actionLoading && (
          <div className={classes.rowActions}>
            <IconButton
              color={'primary'}
              title={'Edituj'}
              size={'small'}
              onClick={() => handleEdit(entity)}
            >
              <EditIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem />
            <IconButton
              color={'primary'}
              title={'Aktivuj'}
              size={'small'}
              onClick={() => handleApprove(entity)}
            >
              <AcceptIcon />
            </IconButton>
            <Divider orientation="vertical" flexItem />
            <IconButton
              color={'secondary'}
              title={'Vymaž'}
              size={'small'}
              onClick={() => handleDelete(entity)}
            >
              <DeleteIcon />
            </IconButton>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
