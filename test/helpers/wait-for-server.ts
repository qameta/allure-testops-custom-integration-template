const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const waitForServer = async (baseUrl: string, attempts = 30): Promise<void> => {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/server/info`);

      if (response.ok) {
        return;
      }
    } catch {
      // Retry until the container is ready.
    }

    await sleep(500);
  }

  throw new Error(`Server did not become ready at ${baseUrl}`);
};
