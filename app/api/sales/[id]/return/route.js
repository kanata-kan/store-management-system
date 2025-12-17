/**
 * Return Sale API Route
 *
 * POST /api/sales/[id]/return
 * Return a sale (Manager only)
 * Body: { reason: string }
 */

import { requireManager } from "@/lib/auth/middleware.js";
import SaleService from "@/lib/services/SaleService.js";
import { success, error } from "@/lib/api/response.js";
import { createError } from "@/lib/utils/errorFactory.js";

/**
 * POST /api/sales/[id]/return
 * Return a sale (Manager only)
 * Body: { reason: string }
 */
export async function POST(request, { params }) {
  try {
    const manager = await requireManager(request);
    const { id } = params;

    const body = await request.json();
    const { reason } = body;

    // Validate reason
    if (!reason || !reason.trim()) {
      return error(
        createError(
          "Le motif de retour est requis",
          "VALIDATION_ERROR",
          400
        )
      );
    }

    // Return sale
    const returnedSale = await SaleService.returnSale(
      id,
      manager.id,
      reason.trim()
    );

    return success(returnedSale, 200);
  } catch (err) {
    return error(err);
  }
}

