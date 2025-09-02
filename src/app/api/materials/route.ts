import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { MaterialsLink } from '@/app/types';

const dataFilePath = path.join(process.cwd(), 'data', 'materials-links.json');

// Ensure data directory exists
async function ensureDataDirectory() {
  const dataDir = path.dirname(dataFilePath);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Read links from file
async function readLinks(): Promise<MaterialsLink[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default links
    const defaultLinks: MaterialsLink[] = [
      {
        id: "1",
        title: "Master Questionnaire",
        url: "https://ipsosgroup.sharepoint.com/:w:/r/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q3%202025/Questionnaire/SMS%20Coke%20Master%20Questionnaire_Q2_2025_V1.docx?d=w30645244478f4f208532c45beb3b453f&csf=1&web=1&e=n6TUS4",
        description: "Q2 2025 / 25-004044-01-30",
        lastUpdated: new Date().toISOString(),
        updatedBy: "System"
      },
      {
        id: "2",
        title: "Country Specific Questions",
        url: "https://ipsosgroup.sharepoint.com/:x:/r/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/!%20Coke%20SMS%20-%20Country%20specific%20questions_Linked%20with%20Q%27re.xlsx?d=wd8826cbcca3a43bebdc9c7eb17a0de10&csf=1&web=1&e=5MaGCF",
        description: "Excel country specific",
        lastUpdated: new Date().toISOString(),
        updatedBy: "System"
      },
      {
        id: "3",
        title: "QCF iField",
        url: "https://ipsosgroup.sharepoint.com/:x:/t/BG-PM-Team/EUCG2wpu3CRKhEPIeIEbHTYBTjbqcl1kWsS0O827uvtufg?e=L3XYVH",
        description: "QCF iField",
        lastUpdated: new Date().toISOString(),
        updatedBy: "System"
      },
      {
        id: "4",
        title: "QCF Dimensions",
        url: "https://ipsosgroup.sharepoint.com/:x:/t/BG-PM-Team/EewYESO3ZWdHs1b7BBYPYmYBttO0dYHkGq-_GTFQ81dxWA",
        description: "QCF Dimensions",
        lastUpdated: new Date().toISOString(),
        updatedBy: "System"
      },
      {
        id: "5",
        title: "Offline Market Info",
        url: "https://ipsosgroup.sharepoint.com/:x:/r/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q3%202025/Fieldwork%20coordination/Offline/Coke%20SMS%20EU%20Q3%202025-%20offline%20Market%20info.xlsx?d=wcea8ffa57f404e109082a17d9c48c59c&csf=1&web=1&e=ZNHKyT",
        description: "iField INFO (NWB info, BC+SAR, Variables to transfer)",
        lastUpdated: new Date().toISOString(),
        updatedBy: "System"
      },
      {
        id: "6",
        title: "Brand List - Export",
        url: "https://cc-db-export.vercel.app/",
        description: "Brand lists Dim. Markets",
        lastUpdated: new Date().toISOString(),
        updatedBy: "System"
      },
      {
        id: "7",
        title: "Quotas",
        url: "https://ipsosgroup.sharepoint.com/:x:/r/teams/MSU-COKE-SmallMarketSolution-TEAM/Shared%20Documents/General/OPS_FILES/Q3%202025/Quotas/EU%20SMS%20Quotas%20Online%20-%20Q3%202025_v1.xlsx?d=w9847f0a9c02a4377a74aaa0360e1a8b3&csf=1&web=1&e=aIX2Qq",
        description: "Dim QUOTAS",
        lastUpdated: new Date().toISOString(),
        updatedBy: "System"
      }
    ];
    
    // Save default links to file
    await fs.writeFile(dataFilePath, JSON.stringify(defaultLinks, null, 2));
    return defaultLinks;
  }
}

// Write links to file
async function writeLinks(links: MaterialsLink[]): Promise<void> {
  await ensureDataDirectory();
  await fs.writeFile(dataFilePath, JSON.stringify(links, null, 2));
}

// GET - Retrieve all links
export async function GET() {
  try {
    const links = await readLinks();
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST - Create a new link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, description, updatedBy = "Anonymous" } = body;
    
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }
    
    const links = await readLinks();
    const newLink: MaterialsLink = {
      id: Date.now().toString(),
      title,
      url,
      description,
      lastUpdated: new Date().toISOString(),
      updatedBy
    };
    
    links.push(newLink);
    await writeLinks(links);
    
    return NextResponse.json(newLink, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

// PUT - Update an existing link
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, url, description, updatedBy = "Anonymous" } = body;
    
    if (!id || !title || !url) {
      return NextResponse.json(
        { error: 'ID, title, and URL are required' },
        { status: 400 }
      );
    }
    
    const links = await readLinks();
    const linkIndex = links.findIndex(link => link.id === id);
    
    if (linkIndex === -1) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    
    links[linkIndex] = {
      ...links[linkIndex],
      title,
      url,
      description,
      lastUpdated: new Date().toISOString(),
      updatedBy
    };
    
    await writeLinks(links);
    
    return NextResponse.json(links[linkIndex]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const links = await readLinks();
    const filteredLinks = links.filter(link => link.id !== id);
    
    if (filteredLinks.length === links.length) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    
    await writeLinks(filteredLinks);
    
    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}

