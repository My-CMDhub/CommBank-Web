import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
import { faDollarSign, IconDefinition, faSmile, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date'
import 'date-fns'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { updateGoal as updateGoalApi } from '../../../api/lib'
import { Goal } from '../../../api/types'
import { selectGoalsMap, updateGoal as updateGoalRedux } from '../../../store/goalsSlice'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import DatePicker from '../../components/DatePicker'
import EmojiPicker from '../../components/EmojiPicker'
import { Theme } from '../../components/Theme'
import GoalIcon from './GoalIcon'

type Props = { goal: Goal }
export function GoalManager(props: Props) {
  const dispatch = useAppDispatch()

  const goal = useAppSelector(selectGoalsMap)[props.goal.id]

  const [name, setName] = useState<string | null>(null)
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [targetAmount, setTargetAmount] = useState<number | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isUpdatingIcon, setIsUpdatingIcon] = useState(false)

  useEffect(() => {
    setName(props.goal.name)
    setTargetDate(props.goal.targetDate)
    setTargetAmount(props.goal.targetAmount)
  }, [
    props.goal.id,
    props.goal.name,
    props.goal.targetDate,
    props.goal.targetAmount,
  ])

  useEffect(() => {
    setName(goal.name)
  }, [goal.name])

  const updateNameOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextName = event.target.value
    setName(nextName)
    const updatedGoal: Goal = {
      ...props.goal,
      name: nextName,
    }
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const updateTargetAmountOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextTargetAmount = parseFloat(event.target.value)
    setTargetAmount(nextTargetAmount)
    const updatedGoal: Goal = {
      ...props.goal,
      name: name ?? props.goal.name,
      targetDate: targetDate ?? props.goal.targetDate,
      targetAmount: nextTargetAmount,
    }
    dispatch(updateGoalRedux(updatedGoal))
    updateGoalApi(props.goal.id, updatedGoal)
  }

  const pickDateOnChange = (date: MaterialUiPickersDate) => {
    if (date != null) {
      setTargetDate(date)
      const updatedGoal: Goal = {
        ...props.goal,
        name: name ?? props.goal.name,
        targetDate: date ?? props.goal.targetDate,
        targetAmount: targetAmount ?? props.goal.targetAmount,
      }
      dispatch(updateGoalRedux(updatedGoal))
      updateGoalApi(props.goal.id, updatedGoal)
    }
  }

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker)
  }

  const selectEmoji = async (emoji: string) => {
    setIsUpdatingIcon(true)
    try {
      const updatedGoal: Goal = {
        ...props.goal,
        icon: emoji,
      }
      dispatch(updateGoalRedux(updatedGoal))
      await updateGoalApi(props.goal.id, updatedGoal)
    } catch (error) {
      console.error('Failed to update icon:', error)
    } finally {
      setIsUpdatingIcon(false)
      setShowEmojiPicker(false)
    }
  }

  const removeIcon = async () => {
    setIsUpdatingIcon(true)
    try {
      const { icon, ...goalWithoutIcon } = props.goal
      const updatedGoal: Goal = {
        ...goalWithoutIcon,
        icon: undefined,
      }
      dispatch(updateGoalRedux(updatedGoal))
      await updateGoalApi(props.goal.id, updatedGoal)
    } catch (error) {
      console.error('Failed to remove icon:', error)
    } finally {
      setIsUpdatingIcon(false)
    }
  }

  return (
    <GoalManagerContainer>
      <NameInput value={name ?? ''} onChange={updateNameOnChange} />

      <IconSelectionContainer>
        {goal.icon ? (
          <GoalIconWrapper>
            <GoalIconContainer onClick={!isUpdatingIcon ? toggleEmojiPicker : undefined}>
              {isUpdatingIcon ? (
                <IconLoadingIndicator>Updating...</IconLoadingIndicator>
              ) : (
                <GoalIcon icon={goal.icon} onClick={toggleEmojiPicker} />
              )}
            </GoalIconContainer>
            <RemoveIconButton onClick={!isUpdatingIcon ? removeIcon : undefined} disabled={isUpdatingIcon}>
              <FontAwesomeIcon icon={faTimes} />
            </RemoveIconButton>
          </GoalIconWrapper>
        ) : (
          <AddIconButton onClick={!isUpdatingIcon ? toggleEmojiPicker : undefined} disabled={isUpdatingIcon}>
            {isUpdatingIcon ? (
              <IconLoadingIndicator>Adding...</IconLoadingIndicator>
            ) : (
              <>
                <FontAwesomeIcon icon={faSmile} size="2x" />
                <AddIconText>Add Icon</AddIconText>
              </>
            )}
          </AddIconButton>
        )}
        {showEmojiPicker && !isUpdatingIcon && (
          <EmojiPickerContainer>
            <EmojiPicker onSelect={selectEmoji} />
          </EmojiPickerContainer>
        )}
      </IconSelectionContainer>

      <Group>
        <Field name="Target Date" icon={faCalendarAlt} />
        <Value>
          <DatePicker value={targetDate} onChange={pickDateOnChange} />
        </Value>
      </Group>

      <Group>
        <Field name="Target Amount" icon={faDollarSign} />
        <Value>
          <StringInput value={targetAmount ?? ''} onChange={updateTargetAmountOnChange} />
        </Value>
      </Group>

      <Group>
        <Field name="Balance" icon={faDollarSign} />
        <Value>
          <StringValue>{props.goal.balance}</StringValue>
        </Value>
      </Group>

      <Group>
        <Field name="Date Created" icon={faCalendarAlt} />
        <Value>
          <StringValue>{new Date(props.goal.created).toLocaleDateString()}</StringValue>
        </Value>
      </Group>
    </GoalManagerContainer>
  )
}

type FieldProps = { name: string; icon: IconDefinition }

const Field = (props: FieldProps) => (
  <FieldContainer>
    <FontAwesomeIcon icon={props.icon} size="2x" />
    <FieldName>{props.name}</FieldName>
  </FieldContainer>
)

const GoalManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  height: 100%;
  width: 100%;
  position: relative;
`

const IconSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 20px 0;
  position: relative;
  width: 100%;
`

const GoalIconWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
`

const GoalIconContainer = styled.div<{ onClick?: any }>`
  cursor: ${props => props.onClick ? 'pointer' : 'default'};
  display: flex;
  justify-content: center;
  width: 100%;
`

const RemoveIconButton = styled.button<{ disabled?: boolean }>`
  position: absolute;
  top: 0;
  right: 30%;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.disabled ? '#f44336' : '#d32f2f'};
  }
`

const AddIconButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  background: none;
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 10px 20px;
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  color: #888;
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover {
    border-color: ${props => props.disabled ? '#ccc' : '#888'};
    color: ${props => props.disabled ? '#888' : '#555'};
  }
`

const IconLoadingIndicator = styled.div`
  font-size: 1.2rem;
  color: #888;
  padding: 10px;
`

const AddIconText = styled.span`
  margin-left: 10px;
  font-size: 1.2rem;
`

const EmojiPickerContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  margin-top: 10px;
`

const Group = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
`

const NameInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 4rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const FieldName = styled.h1`
  font-size: 1.8rem;
  margin-left: 1rem;
  color: rgba(174, 174, 174, 1);
  font-weight: normal;
`

const FieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 20rem;

  svg {
    color: rgba(174, 174, 174, 1);
  }
`

const StringValue = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
`

const StringInput = styled.input`
  display: flex;
  background-color: transparent;
  outline: none;
  border: none;
  font-size: 1.8rem;
  font-weight: bold;
  color: ${({ theme }: { theme: Theme }) => theme.text};
`

const Value = styled.div`
  margin-left: 2rem;
`
