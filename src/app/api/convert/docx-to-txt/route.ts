import { NextResponse } from "next/server";
import { convertDocxToTxt } from "@/services/docx-to-txt/convert.service";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSION = ".docx";
const ALLOWED_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // ===== VALIDATION =====
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(ALLOWED_EXTENSION)) {
      return NextResponse.json(
        { error: "Only .docx files are allowed" },
        { status: 400 }
      );
    }

    if (file.type !== ALLOWED_MIME) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // ===== CONVERT =====
    const result = await convertDocxToTxt(file);

    return NextResponse.json({
      success: true,
      fileName: result.fileName,
      downloadUrl: result.downloadUrl,
    });
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
}