import test from "node:test";
import assert from "node:assert/strict";
import { errorResponse } from "./response";

test("database connectivity issues return 503", async () => {
  const response = errorResponse(new Error("Can't reach database server at 127.0.0.1:51218"));

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "No se pudo conectar a la base de datos. Verifica que PostgreSQL esté en ejecución.",
  });
});
