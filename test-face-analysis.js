// Simple test to verify face analysis enhancement
// This would be run in a browser console on the scan-face page

async function testFaceAnalysis() {
  console.log("Testing enhanced face analysis...");

  // Create a simple test canvas with red pixels to simulate redness
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");

  // Fill with red color to simulate high redness
  ctx.fillStyle = "rgb(200, 50, 50)";
  ctx.fillRect(0, 0, 100, 100);

  // Convert to blob
  canvas.toBlob(async (blob) => {
    const file = new File([blob], "test-face.png", { type: "image/png" });

    try {
      // Test the client-side analysis function
      const { analyzeFaceImage } = await import("./lib/face-analysis.ts");
      const result = await analyzeFaceImage(file);

      console.log("Analysis Result:", result);
      console.log("Problems Detected:", result.problems_detected);
      console.log("Treatments:", result.treatments);

      // Verify expected structure
      if (result.problems_detected && result.problems_detected.length > 0) {
        console.log("✅ Problems detected successfully");
        console.log("First problem:", result.problems_detected[0]);
      }

      if (result.treatments && result.treatments.length > 0) {
        console.log("✅ Treatments generated successfully");
        console.log("First treatment:", result.treatments[0]);
      }
    } catch (error) {
      console.error("❌ Test failed:", error);
    }
  }, "image/png");
}

// Run the test
// testFaceAnalysis();

console.log(
  "Test script loaded. Run testFaceAnalysis() to test the enhanced face analysis."
);
