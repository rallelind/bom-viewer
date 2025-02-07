import { NextResponse } from "next/server";
import pdf from "pdf-parse";

interface BillOfMaterialItem {
  type: string;
  level: number;
  id: string;
  name: string;
  unit: string;
  quantity: number;
}

function insertSpaces(str: string) {
  return (
    str
      // Insert a space between an uppercase sequence and an Uppercase letter followed by a lowercase letter.
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      // Insert a space between a lowercase letter or digit and an uppercase letter.
      .replace(/([a-z\d])([A-Z])/g, "$1 $2")
      // Insert a space between a letter and a digit.
      .replace(/([A-Za-z])(\d)/g, "$1 $2")
      .trim()
  );
}

function parseBOM(rawText: string) {
  const lines = rawText.split("\n");
  const bomItems = [];
  let currentBomItem: Partial<BillOfMaterialItem> | null = null;

  let missingItems = 6;
  let isHeader = true;

  console.log(lines.slice(13))

  for (const line of lines.slice(13)) {
    const insertedSpaces = insertSpaces(line);
    const parts = insertedSpaces.split(" ");

    console.log(parts)

    const lineContainsBomHeader = line.includes("Complete");

    if (lineContainsBomHeader) {
      continue;
    }

    for (const part of parts) {
      // missing item determines where the part is starting from if 6 then it is the first item and so on
      if (missingItems === 6) {
        currentBomItem = {
          level: Number(part),
        };
      }

      if (missingItems === 5) {
        currentBomItem!.type = part;
      }

      if (missingItems === 4) {
        currentBomItem!.id = insertSpaces(part);
      }

      if (missingItems === 3) {
        currentBomItem!.name = part;
      }

      if (missingItems === 2) {
        currentBomItem!.quantity = Number(part);
      }

      if (missingItems === 1) {
        currentBomItem!.unit = part;
      }

      const newMissingItem = missingItems - 1;

      if (newMissingItem === 0) {
        missingItems = 6;
        bomItems.push(currentBomItem);
        currentBomItem = null;
        continue;
      }

      missingItems = newMissingItem;
    }
  }

  return bomItems;
}

export async function POST(request: Request) {
  try {
    // Retrieve the file from the incoming form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return new NextResponse("No file found", { status: 400 });
    }

    // Convert the file into a Buffer for pdf-parse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF and populate pageTextContent
    const pdfParsed = await pdf(buffer);

    const parsedBom = parseBOM(pdfParsed.text);

    return NextResponse.json(parsedBom);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
