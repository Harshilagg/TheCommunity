import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "@/app/page";
import { SITE_NAME } from "@/config/site";

test("home page shows the site name from config", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1, name: SITE_NAME })).toBeDefined();
});
