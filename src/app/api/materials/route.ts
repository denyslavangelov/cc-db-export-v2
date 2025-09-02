import { NextRequest, NextResponse } from 'next/server'
import { MaterialsLink } from '@/app/types'

// In-memory storage for production (will reset on server restart)
let materialsLinks: MaterialsLink[] = [
  {
    id: "1",
    title: "CCDB Export Tool",
    url: "https://cc-db-export.vercel.app",
    description: "Main export tool for generating CSV and text files",
    lastUpdated: new Date().toISOString(),
    updatedBy: "System"
  },
  {
    id: "2", 
    title: "SharePoint Directory",
    url: "https://ipsosgroup.sharepoint.com/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/Forms/AllItems.aspx?FolderCTID=0x0120003F91AC7BBE846B44835EC129AE411B38&id=%2Fteams%2FMSU-COKE-SmallMarketSolution-TEAM%2FShared+Documents%2FGeneral%2FOPS_FILES&OR=Teams-HL&CT=1730392210797",
    description: "Access to project files and resources",
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
    const { title, url, description } = body

    // Validation
    if (!title || !url) {
      const errorResponse = NextResponse.json(
        { error: 'Title and URL are required' },
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
    const { id, title, url, description } = body

    // Validation
    if (!id || !title || !url) {
      const errorResponse = NextResponse.json(
        { error: 'ID, title and URL are required' },
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

