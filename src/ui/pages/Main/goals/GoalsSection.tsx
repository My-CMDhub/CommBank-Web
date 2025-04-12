import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { createGoal as createGoalApi, getGoals } from '../../../../api/lib'
import { Goal } from '../../../../api/types'
import { createGoal as createGoalRedux, selectGoalsList } from '../../../../store/goalsSlice'
import { useAppDispatch, useAppSelector } from '../../../../store/hooks'
import {
  setContent as setContentRedux,
  setIsOpen as setIsOpenRedux,
  setType as setTypeRedux,
} from '../../../../store/modalSlice'
import { SectionHeading } from '../../../components/SectionHeading'
import { media } from '../../../utils/media'
import GoalsContent from './GoalsContent'

export default function GoalsSection() {
  const dispatch = useAppDispatch()
  const goalIds = useAppSelector(selectGoalsList)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    async function fetch() {
      if (retryCount >= maxRetries) {
        if (isMounted) setError('Failed to load goals after multiple attempts');
        return;
      }
      
      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }
      
      try {
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const goals = await Promise.race([
          getGoals(),
          timeoutPromise
        ]);
        
        if (isMounted && goals && Array.isArray(goals)) {
          goals.forEach((goal: Goal) => dispatch(createGoalRedux(goal)))
          setIsLoading(false);
        } else if (isMounted) {
          setIsLoading(false);
        }
      } catch (error) {
        retryCount++;
        if (isMounted) {
          console.log(`Attempt ${retryCount} failed, ${maxRetries - retryCount} retries left`);
          setIsLoading(false);
          
          // Only retry after a delay
          setTimeout(fetch, 2000);
        }
      }
    }
    
    // Only fetch if we don't already have goals
    if (goalIds.length === 0) {
      fetch();
    }
    
    return () => {
      isMounted = false;
    };
  }, [dispatch, goalIds.length]);

  const onClick = async () => {
    if (isCreating) return; // Prevent multiple clicks
    
    setIsCreating(true);
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      );
      
      const goal = await Promise.race([
        createGoalApi(),
        timeoutPromise
      ]);

      if (goal != null) {
        dispatch(createGoalRedux(goal as Goal))
        dispatch(setContentRedux(goal as Goal))
        dispatch(setTypeRedux('Goal'))
        dispatch(setIsOpenRedux(true))
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Container>
      <TopGroup>
        <SectionHeading>Goals</SectionHeading>
        <Icon onClick={onClick} disabled={isCreating}>
          <FontAwesomeIcon icon={faPlusCircle} size="2x" className={isCreating ? "disabled" : "alert"} />
        </Icon>
      </TopGroup>

      {isLoading && <LoadingMessage>Loading goals...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!isLoading && !error && <GoalsContent ids={goalIds} />}
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  margin-top: 2rem;
  margin-bottom: 2rem;

  ${media('<tablet')} {
    width: 100%;
  }
`

const TopGroup = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;

  ${media('<tablet')} {
    flex-direction: column;
  }
`

const Icon = styled.a<{ disabled?: boolean }>`
  margin-left: 1rem;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
`

const LoadingMessage = styled.div`
  text-align: center;
  padding: 1rem;
  color: #888;
`

const ErrorMessage = styled.div`
  text-align: center;
  padding: 1rem;
  color: #d32f2f;
`
