import html2pdf from "html2pdf.js";

export function downloadPDF(htmlContent, filename = "download.pdf") {
  const element = document.createElement("div");
  element.innerHTML = htmlContent;
  element.style.padding = "20px";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.fontSize = "12px";

  // Apply additional styling to make it look clean in PDF
  document.body.appendChild(element);

  html2pdf()
    .set({
      margin: 0.5,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    })
    .from(element)
    .save()
    .then(() => {
      document.body.removeChild(element); // clean up
    })
    .catch((err) => {
      console.error("PDF Download failed:", err);
      document.body.removeChild(element);
    });
}
