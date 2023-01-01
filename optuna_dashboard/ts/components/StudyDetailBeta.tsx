import React, { FC, useEffect } from "react"
import { useRecoilValue } from "recoil"
import { Link, useParams } from "react-router-dom"
import {
  Card,
  CardContent,
  Box,
  Typography,
  useTheme,
  ListItem,
  IconButton,
} from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import HomeIcon from "@mui/icons-material/Home"

import { GraphHistory } from "./GraphHistory"
import { Note } from "./Note"
import { actionCreator } from "../action"
import {
  reloadIntervalState,
  useStudyDetailValue,
  useStudyDirections,
  useStudyName,
  useStudySummaryValue,
} from "../state"
import { TrialTable } from "./TrialTable"
import { AppDrawer } from "./AppDrawer"
import { GraphParallelCoordinate } from "./GraphParallelCoordinate"
import { Contour } from "./GraphContour"
import { GraphHyperparameterImportanceBeta } from "./GraphHyperparameterImportances"
import { GraphSlice } from "./GraphSlice"
import { GraphParetoFront } from "./GraphParetoFront"
import { DataGrid, DataGridColumn } from "./DataGrid"
import List from "@mui/material/List"
import { GraphIntermediateValues } from "./GraphIntermediateValues"

interface ParamTypes {
  studyId: string
}

export const StudyDetailBeta: FC<{
  toggleColorMode: () => void
  page: PageId
}> = ({ toggleColorMode, page }) => {
  const theme = useTheme()
  const action = actionCreator()
  const { studyId } = useParams<ParamTypes>()
  const studyIdNumber = parseInt(studyId, 10)
  const studyDetail = useStudyDetailValue(studyIdNumber)
  const reloadInterval = useRecoilValue<number>(reloadIntervalState)
  const studySummary = useStudySummaryValue(studyIdNumber)
  const directions = useStudyDirections(studyIdNumber)
  const studyName = useStudyName(studyIdNumber)
  const userAttrs = studySummary?.user_attrs || []

  const title =
    studyName !== null ? `${studyName} (id=${studyId})` : `Study #${studyId}`

  useEffect(() => {
    action.updateStudyDetail(studyIdNumber)
  }, [])

  useEffect(() => {
    if (reloadInterval < 0 || page === "trials") {
      return
    }
    const intervalId = setInterval(function () {
      action.updateStudyDetail(studyIdNumber)
    }, reloadInterval * 1000)
    return () => clearInterval(intervalId)
  }, [reloadInterval, studyDetail, page])

  const userAttrColumns: DataGridColumn<Attribute>[] = [
    { field: "key", label: "Key", sortable: true },
    { field: "value", label: "Value", sortable: true },
  ]
  const trials: Trial[] = studyDetail?.trials || []

  let content = null
  if (page === "history") {
    content = (
      <Box sx={{ display: "flex", width: "100%", flexDirection: "column" }}>
        {directions !== null && directions.length > 1 ? (
          <Card sx={{ margin: theme.spacing(2) }}>
            <CardContent>
              <GraphParetoFront study={studyDetail} />
            </CardContent>
          </Card>
        ) : null}
        <Card
          sx={{
            margin: theme.spacing(2),
          }}
        >
          <CardContent>
            <GraphHistory study={studyDetail} />
          </CardContent>
        </Card>
        {studyDetail !== null &&
        studyDetail.directions.length == 1 &&
        studyDetail.has_intermediate_values ? (
          <Card sx={{ margin: theme.spacing(2) }}>
            <CardContent>
              <GraphIntermediateValues trials={trials} />
            </CardContent>
          </Card>
        ) : null}
        <Grid2 container spacing={2}>
          <Grid2 xs={6}>
            <Card sx={{ margin: theme.spacing(2) }}>
              <CardContent>
                {studyDetail !== null &&
                  studyDetail.best_trials.length === 1 && (
                    <>
                      <Typography
                        variant="h6"
                        sx={{ margin: "1em 0", fontWeight: 600 }}
                      >
                        Best Trial
                      </Typography>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 600 }}
                        color="secondary"
                      >
                        {studyDetail.best_trials[0].values}
                      </Typography>
                      <Typography>
                        Params = [
                        {studyDetail.best_trials[0].params
                          .map((p) => `${p.name}: ${p.value}`)
                          .join(", ")}
                        ]
                      </Typography>
                    </>
                  )}
                {studyDetail !== null && studyDetail.directions.length > 1 && (
                  <>
                    <Typography
                      variant="h6"
                      sx={{ margin: "1em 0", fontWeight: 600 }}
                    >
                      Best Trials ({studyDetail.best_trials.length} trials)
                    </Typography>
                    {studyDetail.best_trials.map((trial, i) => (
                      <Card
                        key={i}
                        sx={{
                          border: "1px solid rgba(128,128,128,0.5)",
                          margin: theme.spacing(1, 0),
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6">
                            Trial number={trial.number} (trial_id=
                            {trial.trial_id})
                          </Typography>
                          <Typography>
                            Objective Values = [{trial.values?.join(", ")}]
                          </Typography>
                          <Typography>
                            Params = [
                            {trial.params
                              .map((p) => `${p.name}: ${p.value}`)
                              .join(", ")}
                            ]
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid2>
          <Grid2 xs={6}>
            <Card sx={{ margin: theme.spacing(2) }}>
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ margin: "1em 0", fontWeight: 600 }}
                >
                  Study User Attributes
                </Typography>
                <DataGrid<Attribute>
                  columns={userAttrColumns}
                  rows={userAttrs}
                  keyField={"key"}
                  dense={true}
                  initialRowsPerPage={5}
                  rowsPerPageOption={[5, 10, { label: "All", value: -1 }]}
                />
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>
      </Box>
    )
  } else if (page === "analytics") {
    content = (
      <Box sx={{ display: "flex", width: "100%", flexDirection: "column" }}>
        <Typography variant="h5" sx={{ margin: theme.spacing(2) }}>
          Hyperparameter Importance
        </Typography>
        <GraphHyperparameterImportanceBeta
          studyId={studyIdNumber}
          study={studyDetail}
        />
        <Typography variant="h5" sx={{ margin: theme.spacing(2) }}>
          Hyperparameter Relationships
        </Typography>
        <Card sx={{ margin: theme.spacing(2) }}>
          <CardContent>
            <GraphSlice study={studyDetail} />
          </CardContent>
        </Card>
        <Card sx={{ margin: theme.spacing(2) }}>
          <CardContent>
            <GraphParallelCoordinate study={studyDetail} />
          </CardContent>
        </Card>
        <Card sx={{ margin: theme.spacing(2) }}>
          <CardContent>
            <Contour study={studyDetail} />
          </CardContent>
        </Card>
      </Box>
    )
  } else if (page === "trials") {
    content = (
      <Card sx={{ margin: theme.spacing(2) }}>
        <CardContent>
          <TrialTable studyDetail={studyDetail} />
        </CardContent>
      </Card>
    )
  } else if (page === "note") {
    content =
      studyDetail !== null ? (
        <Note
          studyId={studyIdNumber}
          latestNote={studyDetail.note}
          minRows={30}
        />
      ) : null
  }

  const toolbar = (
    <>
      <IconButton
        component={Link}
        to={URL_PREFIX + "/beta"}
        sx={{ marginRight: theme.spacing(1) }}
        color="inherit"
        title="Return to the top page"
      >
        <HomeIcon />
      </IconButton>
      <ChevronRightIcon sx={{ marginRight: theme.spacing(1) }} />
      <Typography variant="h5" noWrap component="div">
        {title}
      </Typography>
    </>
  )

  return (
    <Box sx={{ display: "flex" }}>
      <AppDrawer
        studyId={studyIdNumber}
        page={page}
        toggleColorMode={toggleColorMode}
        toolbar={toolbar}
      >
        {content}
      </AppDrawer>
    </Box>
  )
}
