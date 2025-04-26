import html2pdf from "html2pdf.js";

export const downloadPDF = (elementId, filename = "SkillInsight.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) return;
  html2pdf().from(element).save(filename);
};
