import React, { useState, useEffect, ContextType } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { faArrowUp, faArrowDown, faSearch } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { Switch } from "@material-ui/core"
import {useAppState} from "StateProvider"
export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const { filterType, sortType, searchText,setRollStateArr, rollStateArr, filterBy, setFilterBy } = useAppState()
  const [rollSummary, setRollSummary] = useState({ all: 0, present: 0, late: 0, absent: 0 })
  useEffect(() => {
    void getStudents()
  }, [getStudents])

   useEffect(() => {
    if (isRollMode) {
      const rollArray = []
      if (data?.students) {
        for (const student of data.students) {
          rollArray.push({ student_id: student.id, roll_state: "unmark" })
        }
      }
      setRollStateArr(rollArray)
    } else {
      const rollArray: any = []
      setRollStateArr(rollArray)
    }
  }, [isRollMode])

  useEffect(() => {
    const calcRollSummary = {
      all: rollStateArr.length,
      present: rollStateArr.filter((student: any) => student.roll_state === "present").length,
      late: rollStateArr.filter((student: any) => student.roll_state === "late").length,
      absent: rollStateArr.filter((student: any) => student.roll_state === "absent").length,
    }
    setRollSummary(calcRollSummary)
  }, [rollStateArr])
  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {data.students
              .sort((a, b) => {
                if (sortType === "asc" && (filterType === "first_name" || filterType === "last_name")) {
                  return a[filterType].toUpperCase() > b[filterType].toUpperCase() ? 1 : -1
                }
                return (filterType === "first_name" || filterType === "last_name") && a[filterType].toUpperCase() < b[filterType].toUpperCase() ? 1 : -1
              })
              .filter((item) => {
                if ((item.first_name + item.last_name).toUpperCase().includes(searchText.toUpperCase().replace(/ /g, ""))) {
                  return true
                }
                return false
              }).filter((item) => {
                if (isRollMode) {
                  const studentRollState: any = rollStateArr?.find((studentRoll: any) => studentRoll.student_id === item.id)
                  if (studentRollState?.roll_state === filterBy) {
                    console.log(filterBy)
                    return true
                  } else if (filterBy === "all") {
                    return true
                  } else {
                    return false
                  }
                } else {
                  return true
                }
              }).map((s:any) => 
              (
              <StudentListTile
                  key={s.id}
                  isRollMode={isRollMode}
                  student={s}
                  initialState={(rollStateArr as any)?.find((studentRollState: any) => studentRollState.student_id === s.id)?.roll_state}
                ></StudentListTile>
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} rollSummary={rollSummary} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
type SortType = "asc" | "desc"
type FilterType = "first" | "last"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick } = props
  const { sortType, setSortType, filterType, setFilterType, searchText, setSearchText } = useAppState()
  return (
    <S.ToolbarContainer>
      <S.SortContainer>
        <S.Button onClick={() => (sortType === "asc" ? setSortType("desc") : setSortType("asc"))}>
          <FontAwesomeIcon icon={sortType === "asc" ? faArrowUp : faArrowDown} size="sm" />
          <span> {sortType === "asc" ? "Asc" : "Desc"}</span>
        </S.Button>
        <Switch color={"default"} checked={filterType === "first_name" ? true : false} onChange={() => (filterType === "first_name" ? setFilterType("last_name") : setFilterType("first_name"))} />
        <span>{filterType === "first_name" ? "First Name" : "Last Name"}</span>
      </S.SortContainer>
      <S.SearchContainer>
        <FontAwesomeIcon icon={faSearch} size="sm" />
        <input placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
      </S.SearchContainer>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  SearchContainer: styled.div`
    background-color: white;
    border-radius: 2px;
    padding: 5px;
    color: grey;
    > input {
      outline: none;
      border: none;
      margin-left: 2px;
    }
  `,
  SortContainer: styled.div`
    background-color: ${Colors.blue.base};
    width: 40%;
    justify-content:space-between;
    border-radius: 2px;
    padding: 10px;
    margin-right: 10px;
  `,
}
