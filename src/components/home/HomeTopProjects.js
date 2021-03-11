/** @jsx jsx */

import { jsx } from 'theme-ui'
import { useApolloClient } from '@apollo/client'
import { FETCH_ALL_PROJECTS } from '../../apollo/gql/projects'
import { navigate } from 'gatsby'
import ProjectsList, { OrderByDirection, OrderByField } from '../ProjectsList'
import { useState, useEffect } from 'react'

const HomeTopProjects = ({ projects = [], totalCount = null }) => {
  const client = useApolloClient()
  const [showProjects, setShowProjects] = useState(projects)
  const [orderByField, setOrderByField] = useState(OrderByField.Balance)
  const orderBy = {
    field: orderByField,
    direction: OrderByDirection.DESC
  }

  useEffect(() => {
    const checkProjectsAfterSSR = async () => {
      try {
        // This updates the projects after showing the SSR
        const { data } = await client.query({
          query: FETCH_ALL_PROJECTS,
          variables: { limit: 3, orderBy },
          fetchPolicy: 'network-only'
        })
        const { projects } = data || {}
        setShowProjects(Array.from(projects))
      } catch (error) {
        console.log({ error })
      }
    }
    checkProjectsAfterSSR()
  }, [])

  return (
    <ProjectsList
      projects={showProjects}
      totalCount={totalCount}
      loadMore={() => navigate('/projects')}
      hasMore
      selectOrderByField={setOrderByField}
    />
  )
}

export default HomeTopProjects
