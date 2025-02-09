import { NextResponse } from "next/server";
import pdf from "pdf-parse";

export interface BillOfMaterialItem {
  type: string;
  level: number;
  id: string;
  name: string;
  unit: string;
  quantity: number;
}

function parseBOM(lines: string[]) {
  // we start when we get to the first header that contains the word "Level" then we know we start on next line
  // then we make sure that if we have the first level 0 then it should have the length of 6
  // then while we are running if we hit a point where we are missing items then we go to the next line to find it
  // we run until we hit the quantity which should always be the number and then we know the "middle part" which is the name
  const finalBom: BillOfMaterialItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const currLine = lines[i];
    // hack for unit on next line with m or stk
    const nextLine = lines[i + 1];

    let line = currLine;

    switch (nextLine) {
      case "m":
        line += " m";
        break;
      case "stk":
        line += " stk";
        break;
    }

    const parts = line.split(" ");

    const level = parts[0];
    const type = parts[1];
    const id = parts[2];
    const unit = parts[parts.length - 1];
    const quantity = parts[parts.length - 2];
    const name = parts.slice(3, parts.length - 2).join(" ");

    // if any of the above is none existing then we skip and don't push to final array
    if (!level || !type || !id || !unit || !quantity || !name) {
      continue;
    }

    // validate that level and quantity are numbers
    if (isNaN(parseInt(level))) {
      console.log("Invalid level", level);
      continue;
    }

    if (isNaN(parseFloat(quantity))) {
      console.log("Invalid quantity", quantity);
      continue;
    }

    finalBom.push({
      type,
      level: parseInt(level),
      id,
      name,
      unit,
      quantity: parseFloat(quantity),
    });
  }

  return finalBom;
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

    const lines: string[] = [];

    const options: pdf.Options = {
      pagerender: (pageData) => {
        const page = pageData.getTextContent().then((textContent: any) => {
          lines.push(
            textContent.items.reduce((acc, item, index, arr) => {
              if (index > 0) {
                const prevItem = arr[index - 1];

                // Extract the y positions.
                // In PDF.js, transform[5] is often used for the y-coordinate.
                const prevY = prevItem.transform[5];
                const currY = item.transform[5];

                // Determine the vertical gap between the current item and the previous one.
                // Adjust the threshold (e.g., 5 or 10) based on your PDF's layout.
                if (Math.abs(currY - prevY) > 5) {
                  acc += "\n";
                } else {
                  // Optionally, you can also insert a space if there's a significant horizontal gap.
                  const prevX = prevItem.transform[4];
                  const currX = item.transform[4];
                  if (currX - prevX > 5) {
                    acc += " ";
                  }
                }
              }
              acc += item.str;
              return acc;
            }, "")
          );
        });

        return page;
      },
    };

    // Parse the PDF and populate pageTextContent
    await pdf(buffer, options);

    const allLines: string[] = lines.flatMap((pageText) =>
      pageText.split("\n")
    );

    const parsedBom = parseBOM(allLines);

    console.log(parsedBom)

    return NextResponse.json(parsedBom);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
