import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ROUTES } from "@/constants/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-6">
      <EmptyState
        icon={<CompassIcon />}
        title="Página no encontrada"
        description="Puede que el enlace esté roto o la página ya no exista."
        action={
          <Button asChild>
            <Link href={ROUTES.inicio}>Ir al inicio</Link>
          </Button>
        }
      />
    </div>
  );
}
