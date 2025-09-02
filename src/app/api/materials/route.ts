import { NextRequest, NextResponse } from 'next/server'
import { MaterialsLink } from '@/app/types'

// In-memory storage for production (will reset on server restart)
let materialsLinks: MaterialsLink[] = [
  // 2024 Materials
  {
    id: "2024-q1-1",
    title: "Q1 2024 Master Questionnaire",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q1%202024/Questionnaire/SMS%20Coke%20Master%20Questionnaire_Q1_2024_V1.docx",
    description: "Q1 2024 Master Questionnaire",
    quarter: "Q1",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q1-2",
    title: "Q1 2024 Country Specific Questions",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q1%202024/Country%20Specific/Country%20specific%20questions_Q1_2024.xlsx",
    description: "Q1 2024 Country specific questions Excel",
    quarter: "Q1",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q1-3",
    title: "Q1 2024 Quotas",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q1%202024/Quotas/EU%20SMS%20Quotas%20Online%20-%20Q1%202024_v1.xlsx",
    description: "Q1 2024 Quotas for Dimensions",
    quarter: "Q1",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q2-1",
    title: "Q2 2024 Master Questionnaire",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q2%202024/Questionnaire/SMS%20Coke%20Master%20Questionnaire_Q2_2024_V1.docx",
    description: "Q2 2024 Master Questionnaire",
    quarter: "Q2",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q2-2",
    title: "Q2 2024 Country Specific Questions",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q2%202024/Country%20Specific/Country%20specific%20questions_Q2_2024.xlsx",
    description: "Q2 2024 Country specific questions Excel",
    quarter: "Q2",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q2-3",
    title: "Q2 2024 Quotas",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q2%202024/Quotas/EU%20SMS%20Quotas%20Online%20-%20Q2%202024_v1.xlsx",
    description: "Q2 2024 Quotas for Dimensions",
    quarter: "Q2",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q3-1",
    title: "Q3 2024 Master Questionnaire",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q3%202024/Questionnaire/SMS%20Coke%20Master%20Questionnaire_Q3_2024_V1.docx",
    description: "Q3 2024 Master Questionnaire",
    quarter: "Q3",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q3-2",
    title: "Q3 2024 Country Specific Questions",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q3%202024/Country%20Specific/Country%20specific%20questions_Q3_2024.xlsx",
    description: "Q3 2024 Country specific questions Excel",
    quarter: "Q3",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q3-3",
    title: "Q3 2024 Quotas",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q3%202024/Quotas/EU%20SMS%20Quotas%20Online%20-%20Q3%202024_v1.xlsx",
    description: "Q3 2024 Quotas for Dimensions",
    quarter: "Q3",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q4-1",
    title: "Q4 2024 Master Questionnaire",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q4%202024/Questionnaire/SMS%20Coke%20Master%20Questionnaire_Q4_2024_V1.docx",
    description: "Q4 2024 Master Questionnaire",
    quarter: "Q4",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q4-2",
    title: "Q4 2024 Country Specific Questions",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q4%202024/Country%20Specific/Country%20specific%20questions_Q4_2024.xlsx",
    description: "Q4 2024 Country specific questions Excel",
    quarter: "Q4",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2024-q4-3",
    title: "Q4 2024 Quotas",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q4%202024/Quotas/EU%20SMS%20Quotas%20Online%20-%20Q4%202024_v1.xlsx",
    description: "Q4 2024 Quotas for Dimensions",
    quarter: "Q4",
    year: 2024,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },

  // 2025 Materials
  {
    id: "2025-q1-1",
    title: "Q1 2025 Master Questionnaire",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q1%202025/Questionnaire/SMS%20Coke%20Master%20Questionnaire_Q1_2025_V1.docx",
    description: "Q1 2025 Master Questionnaire",
    quarter: "Q1",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q1-2",
    title: "Q1 2025 Country Specific Questions",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q1%202025/Country%20Specific/Country%20specific%20questions_Q1_2025.xlsx",
    description: "Q1 2025 Country specific questions Excel",
    quarter: "Q1",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q1-3",
    title: "Q1 2025 Quotas",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q1%202025/Quotas/EU%20SMS%20Quotas%20Online%20-%20Q1%202025_v1.xlsx",
    description: "Q1 2025 Quotas for Dimensions",
    quarter: "Q1",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q2-1",
    title: "Q2 2025 Master Questionnaire",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q2%202025/Questionnaire/SMS%20Coke%20Master%20Questionnaire_Q2_2025_V1.docx",
    description: "Q2 2025 Master Questionnaire / 25-004044-01-30",
    quarter: "Q2",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q2-2",
    title: "Q2 2025 Country Specific Questions",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q2%202025/Country%20Specific/!%20Coke%20SMS%20-%20Country%20specific%20questions_Linked%20with%20Q%27re.xlsx",
    description: "Q2 2025 Country specific questions Excel",
    quarter: "Q2",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q2-3",
    title: "Q2 2025 QCF iField",
    url: "https://ipsosgroup.sharepoint.com/:x:/t/BG-PM-Team/EUCG2wpu3CRKhEPIeIEbHTYBTjbqcl1kWsS0O827uvtufg?e=L3XYVH",
    description: "Q2 2025 QCF iField",
    quarter: "Q2",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q2-4",
    title: "Q2 2025 QCF Dimensions",
    url: "https://ipsosgroup.sharepoint.com/:x:/t/BG-PM-Team/EewYESO3ZWdHs1b7BBYPYmYBttO0dYHkGq-_GTFQ81dxWA",
    description: "Q2 2025 QCF Dimensions",
    quarter: "Q2",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q2-5",
    title: "Q2 2025 Brand List - Export",
    url: "https://cc-db-export.vercel.app/",
    description: "Q2 2025 Brand lists Dim. Markets",
    quarter: "Q2",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q2-6",
    title: "Q2 2025 Quotas",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q2%202025/Quotas/EU%20SMS%20Quotas%20Online%20-%20Q2%202025_v1.xlsx",
    description: "Q2 2025 Quotas for Dimensions",
    quarter: "Q2",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q3-1",
    title: "Q3 2025 Master Questionnaire",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q3%202025/Questionnaire/SMS%20Coke%20Master%20Questionnaire_Q3_2025_V1.docx",
    description: "Q3 2025 Master Questionnaire",
    quarter: "Q3",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q3-2",
    title: "Q3 2025 Country Specific Questions",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q3%202025/Country%20Specific/Country%20specific%20questions_Q3_2025.xlsx",
    description: "Q3 2025 Country specific questions Excel",
    quarter: "Q3",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q3-3",
    title: "Q3 2025 Offline Market Info",
    url: "https://ipsosgroup.sharepoint.com/:x:/r/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q3%202025/Fieldwork%20coordination/Offline/Coke%20SMS%20EU%20Q3%202025-%20offline%20Market%20info.xlsx?d=wcea8ffa57f404e109082a17d9c48c59c&csf=1&web=1&e=ZNHKyT",
    description: "Q3 2025 iField INFO (NWB info, BC+SAR, Variables to transfer)",
    quarter: "Q3",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q3-4",
    title: "Q3 2025 Quotas",
    url: "https://ipsosgroup.sharepoint.com/:x:/r/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q3%202025/Quotas/EU%20SMS%20Quotas%20Online%20-%20Q3%202025_v1.xlsx?d=w9847f0a9c02a4377a74aaa0360e1a8b3&csf=1&web=1&e=aIX2Qq",
    description: "Q3 2025 Quotas for Dimensions",
    quarter: "Q3",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q4-1",
    title: "Q4 2025 Master Questionnaire",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q4%202025/Questionnaire/SMS%20Coke%20Master%20Questionnaire_Q4_2025_V1.docx",
    description: "Q4 2025 Master Questionnaire",
    quarter: "Q4",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q4-2",
    title: "Q4 2025 Country Specific Questions",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q4%202025/Country%20Specific/Country%20specific%20questions_Q4_2025.xlsx",
    description: "Q4 2025 Country specific questions Excel",
    quarter: "Q4",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2025-q4-3",
    title: "Q4 2025 Quotas",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q4%202025/Quotas/EU%20SMS%20Quotas%20Online%20-%20Q4%202025_v1.xlsx",
    description: "Q4 2025 Quotas for Dimensions",
    quarter: "Q4",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },

  // General Tools (always available)
  {
    id: "general-1",
    title: "CCDB Export Tool",
    url: "https://cc-db-export.vercel.app",
    description: "Main export tool for generating CSV and text files",
    quarter: "Q2",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "general-2", 
    title: "SharePoint Directory",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/Forms/AllItems.aspx?FolderCTID=0x0120003F91AC7BBE846B44835EC129AE411B38&id=%2Fteams%2FMSU-COKE-SmallMarketSolution-TEAM%2FShared+Documents%2FGeneral%2FOPS_FILES&OR=Teams-HL&CT=1730392210797",
    description: "Access to project files and resources",
    quarter: "Q2",
    year: 2025,
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  }
]

// Helper function to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

export async function OPTIONS() {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function GET() {
  try {
    const response = NextResponse.json(materialsLinks)
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Error fetching materials:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, url, description, quarter, year } = body

    // Validation
    if (!title || !url || !quarter || !year) {
      const errorResponse = NextResponse.json(
        { error: 'Title, URL, quarter, and year are required' },
        { status: 400 }
      )
      return addCorsHeaders(errorResponse)
    }

    // Create new link
    const newLink: MaterialsLink = {
      id: Date.now().toString(),
      title,
      url,
      description: description || '',
      quarter,
      year,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'User'
    }

    materialsLinks.push(newLink)
    
    const response = NextResponse.json(newLink, { status: 201 })
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Error creating material:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, url, description, quarter, year } = body

    // Validation
    if (!id || !title || !url || !quarter || !year) {
      const errorResponse = NextResponse.json(
        { error: 'ID, title, URL, quarter, and year are required' },
        { status: 400 }
      )
      return addCorsHeaders(errorResponse)
    }

    // Find and update link
    const linkIndex = materialsLinks.findIndex(link => link.id === id)
    if (linkIndex === -1) {
      const errorResponse = NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
      return addCorsHeaders(errorResponse)
    }

    materialsLinks[linkIndex] = {
      ...materialsLinks[linkIndex],
      title,
      url,
      description: description || '',
      quarter,
      year,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'User'
    }

    const response = NextResponse.json(materialsLinks[linkIndex])
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Error updating material:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      const errorResponse = NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
      return addCorsHeaders(errorResponse)
    }

    // Find and remove link
    const linkIndex = materialsLinks.findIndex(link => link.id === id)
    if (linkIndex === -1) {
      const errorResponse = NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      )
      return addCorsHeaders(errorResponse)
    }

    const deletedLink = materialsLinks.splice(linkIndex, 1)[0]
    
    const response = NextResponse.json(deletedLink)
    return addCorsHeaders(response)
  } catch (error) {
    console.error('Error deleting material:', error)
    const errorResponse = NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    )
    return addCorsHeaders(errorResponse)
  }
}

