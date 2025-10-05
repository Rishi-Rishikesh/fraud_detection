import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Box,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

const RiskBadge = ({ level, score }) => {
  const colors = {
    LOW: 'success',
    MEDIUM: 'warning',
    HIGH: 'error',
  };

  return (
    <Chip
      label={`${level} (${Math.round(score * 100)}%)`}
      color={colors[level]}
      size="small"
      icon={
        level === 'LOW' ? <CheckCircleIcon /> :
        level === 'MEDIUM' ? <WarningIcon /> :
        <ErrorIcon />
      }
    />
  );
};

export default function TransactionsTable({ transactions, onProvideFeedback }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  const handleFeedback = (tx, isCorrect) => {
    setSelectedTx(tx);
    if (!isCorrect) {
      setFeedbackDialog(true);
    } else {
      onProvideFeedback(tx.id, true, '');
    }
  };

  const handleSubmitFeedback = () => {
    onProvideFeedback(selectedTx.id, false, feedbackNote);
    setFeedbackDialog(false);
    setFeedbackNote('');
    setSelectedTx(null);
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Merchant</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Risk Assessment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <React.Fragment key={tx.id}>
                <TableRow
                  sx={{
                    '& > *': { borderBottom: 'unset' },
                    backgroundColor: tx.is_fraud ? 'error.lighter' : 'inherit',
                  }}
                >
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => setExpandedRow(expandedRow === tx.id ? null : tx.id)}
                    >
                      {expandedRow === tx.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color={tx.amount > 1000 ? 'warning.main' : 'inherit'}
                      sx={{ fontWeight: tx.amount > 1000 ? 600 : 400 }}
                    >
                      ${tx.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>{tx.merchant}</TableCell>
                  <TableCell>
                    <Chip label={tx.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{tx.location}</TableCell>
                  <TableCell>
                    <RiskBadge level={tx.risk_level} score={tx.probability} />
                  </TableCell>
                  <TableCell>
                    {!tx.feedback_correct && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Mark as Correct">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleFeedback(tx, true)}
                          >
                            <ThumbUpIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark as Incorrect">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleFeedback(tx, false)}
                          >
                            <ThumbDownIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                    {tx.feedback_correct === true && (
                      <Tooltip title="Marked as Correct">
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Verified"
                          size="small"
                          color="success"
                        />
                      </Tooltip>
                    )}
                    {tx.feedback_correct === false && (
                      <Tooltip title={`Marked as Incorrect: ${tx.feedback_notes}`}>
                        <Chip
                          icon={<ErrorIcon />}
                          label="Disputed"
                          size="small"
                          color="error"
                        />
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={expandedRow === tx.id} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 2 }}>
                        <Typography variant="h6" gutterBottom component="div">
                          Transaction Details
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Confidence Score
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={tx.confidence_score * 100}
                                color={tx.is_fraud ? 'error' : 'success'}
                              />
                            </Box>
                            <Typography variant="body2">
                              {Math.round(tx.confidence_score * 100)}%
                            </Typography>
                          </Box>
                        </Box>

                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Transaction Type
                            </Typography>
                            <Typography variant="body2">
                              {tx.transaction_type}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Card Type
                            </Typography>
                            <Typography variant="body2">
                              {tx.card_type}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)}>
        <DialogTitle>Provide Feedback</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              fullWidth
              multiline
              rows={4}
              label="Why do you think this prediction is incorrect?"
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            color="primary"
            disabled={!feedbackNote.trim()}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
