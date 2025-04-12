import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { getTransactions as getTransactionsApi } from '../../../../api/lib'
import { Transaction } from '../../../../api/types'
import { Card } from '../../../components/Card'
import { SectionHeading } from '../../../components/SectionHeading'
import { TransparentButton } from '../../../components/TransparentButton'
import { media } from '../../../utils/media'
import TransactionsContent from './TransactionsContent'

export default function TransactionsSection() {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    async function fetch() {
      if (retryCount >= maxRetries) {
        if (isMounted) setError('Failed to load transactions after multiple attempts');
        return;
      }
      
      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }
      
      try {
        // Set a timeout of 5 seconds for the request
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const response = await Promise.race([
          getTransactionsApi(),
          timeoutPromise
        ]);
        
        if (isMounted && response !== null) {
          setTransactions(response);
          setIsLoading(false);
        }
      } catch (error) {
        retryCount++;
        if (isMounted) {
          console.log(`Attempt ${retryCount} failed, ${maxRetries - retryCount} retries left`);
          setIsLoading(false);
          
          // Only retry after a delay to avoid hammering the server
          setTimeout(fetch, 2000);
        }
      }
    }

    fetch();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Container>
      <TopGroup>
        <SectionHeading>Recent Transactions</SectionHeading>

        <TransparentButton>
          <h4 className="alert">See All</h4>
        </TransparentButton>
      </TopGroup>

      {isLoading && <LoadingMessage>Loading transactions...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!isLoading && !error && <TransactionsContent transactions={transactions} />}
    </Container>
  )
}

const Container = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 400px;
  min-height: 400px;
  height: 80%;
  padding: 4rem 2rem;
  overflow-y: hidden;
  border-radius: 2rem;
  margin-top: 2rem;
  margin-bottom: 2rem;

  ${media('<desktop')} {
    height: 450px;
  }

  ${media('<tablet')} {
    width: 100%;
    min-height: 300px;
  }
`

const TopGroup = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;

  h4.alert {
    font-size: 1.4rem;
    font-weight: bold;
  }

  ${media('<tablet')} {
    flex-direction: column;
  }
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
