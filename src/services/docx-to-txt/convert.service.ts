import CloudConvert from "cloudconvert";

const cloudConvert = new CloudConvert(
  process.env.CLOUDCONVERT_API_KEY!
);

export async function convertDocxToTxt(
  file: File
): Promise<{ downloadUrl: string; fileName: string }> {

  const job = await cloudConvert.jobs.create({
    tasks: {
      "import-file": {
        operation: "import/upload",
      },
      "convert-file": {
        operation: "convert",
        input: "import-file",
        output_format: "txt",
      },
      "export-file": {
        operation: "export/url",
        input: "convert-file",
      },
    },
  });

  const uploadTask = job.tasks.find(
    (task) => task.name === "import-file"
  );

  if (!uploadTask) throw new Error("Upload task not found");

  const arrayBuffer = await file.arrayBuffer();

  await cloudConvert.tasks.upload(
    uploadTask,
    Buffer.from(arrayBuffer),
    file.name
  );

  const completedJob = await cloudConvert.jobs.wait(job.id);

  const exportTask = completedJob.tasks.find(
    (task) => task.name === "export-file"
  );

  if (!exportTask) throw new Error("Export task not found");

  const convertedFile = exportTask.result?.files?.[0];

  if (!convertedFile?.url || !convertedFile?.filename) {
    throw new Error("Converted file data not found");
  }

  return {
    downloadUrl: convertedFile.url,
    fileName: convertedFile.filename,
  };
}