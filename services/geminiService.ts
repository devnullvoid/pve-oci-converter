import { GoogleGenAI, Type } from "@google/genai";
import { ContainerConfig } from "../types";

const parseDockerCommand = async (input: string): Promise<ContainerConfig> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the following Docker run command or Docker Compose YAML snippet and extract the configuration necessary to recreate it as a Proxmox LXC OCI container.
    
    Input:
    ${input}
    
    If specific values (like memory, CPU) are missing, infer reasonable defaults based on the image type (e.g., databases need more RAM, static sites need less).
    Default to 1 CPU, 512MB RAM, 8GB Disk if unsure.
    Default storage to "local-lvm".
    Default network to "eth0" and ip "dhcp".
    For features, if the container needs docker-in-docker or similar, set nesting=true.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          image: { type: Type.STRING },
          tag: { type: Type.STRING },
          name: { type: Type.STRING },
          cpus: { type: Type.NUMBER },
          memory: { type: Type.NUMBER, description: "Memory in MB" },
          storage: { type: Type.STRING },
          diskSize: { type: Type.NUMBER, description: "Disk size in GB" },
          netInterface: { type: Type.STRING },
          ip: { type: Type.STRING },
          gateway: { type: Type.STRING },
          env: { 
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                key: { type: Type.STRING },
                value: { type: Type.STRING }
              }
            }
          },
          ports: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                host: { type: Type.NUMBER },
                container: { type: Type.NUMBER },
                protocol: { type: Type.STRING }
              }
            }
          },
          volumes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                host: { type: Type.STRING },
                container: { type: Type.STRING }
              }
            }
          },
          command: { type: Type.ARRAY, items: { type: Type.STRING } },
          entrypoint: { type: Type.ARRAY, items: { type: Type.STRING } },
          privileged: { type: Type.BOOLEAN },
          features: {
            type: Type.OBJECT,
            properties: {
              nesting: { type: Type.BOOLEAN },
              keyctl: { type: Type.BOOLEAN },
              fuse: { type: Type.BOOLEAN }
            }
          }
        },
        required: ["image", "tag", "cpus", "memory", "diskSize"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  try {
    const rawConfig = JSON.parse(text);
    
    // Convert env array [{key, value}] back to record {key: value}
    const envRecord: Record<string, string> = {};
    if (Array.isArray(rawConfig.env)) {
      rawConfig.env.forEach((item: { key: string; value: string }) => {
        if (item.key) {
          envRecord[item.key] = item.value || "";
        }
      });
    }

    const config: ContainerConfig = {
      ...rawConfig,
      env: envRecord,
    };
    
    // Normalize logic
    if (!config.env) config.env = {};
    if (!config.ports) config.ports = [];
    if (!config.volumes) config.volumes = [];
    if (!config.features) config.features = { nesting: true }; // Default to nesting true for OCI usually
    
    return config;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to parse the AI response.");
  }
};

export { parseDockerCommand };
