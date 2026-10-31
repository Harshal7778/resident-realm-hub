import { FileDown, FileText } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";

interface ReportExportButtonsProps {
  filename: string;
  getCsv: () => { headers: string[]; rows: (string | number)[][] };
  disabled?: boolean;
}

export function ReportExportButtons({ filename, getCsv, disabled }: ReportExportButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl"
        disabled={disabled}
        onClick={() => {
          const { headers, rows } = getCsv();
          downloadCsv(filename, headers, rows);
          toast.success("CSV downloaded");
        }}
      >
        <FileDown className="mr-2 h-4 w-4" /> Export CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-11 rounded-xl"
        disabled={disabled}
        onClick={() => toast.info("Report export will be connected in the backend version.")}
      >
        <FileText className="mr-2 h-4 w-4" /> Export PDF
      </Button>
    </div>
  );
}
