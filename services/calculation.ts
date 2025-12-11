const API_BASE = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export interface CalculationParams {
  [key: string]: string | number;
}

export interface CalculationResult {
  name: string;
  result: number;
  unit?: string;
}

export interface CalculationError {
  error: string;
  details?: string;
}

export async function computeCalculation(
  name: string,
  params: CalculationParams
): Promise<CalculationResult> {
  const baseUrl = API_BASE?.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const url = `${baseUrl}/api/compute`;

  console.log('=== Calculation Request ===');
  console.log('URL:', url);
  console.log('Name:', name);
  console.log('Params:', params);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        params,
      }),
    });

    console.log('Response Status:', response.status);

    const responseText = await response.text();
    console.log('Response Text:', responseText.substring(0, 200));

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed Data:', data);
    } catch {
      console.error('JSON Parse Error');
      console.error('Response was:', responseText);
      throw new Error(
        `Server returned invalid response (not JSON). Status: ${response.status}. ` +
          `Please check if the backend server is running at ${baseUrl}`
      );
    }

    if (!response.ok) {
      console.error('Request failed:', data);
      throw new Error(
        data.error || `Request failed with status ${response.status}`
      );
    }

    console.log('=== Success ===');
    return data as CalculationResult;
  } catch (error) {
    console.error('=== Calculation Error ===');
    console.error(error);
    throw error;
  }
}

export interface ExplanationParams {
  calc_name: string;
  result: number | string;
  parameters: Record<string, any>;
  additional_context?: string;
}

export interface ExplanationResponse {
  explanation: string;
}

export async function getExplanation(
  params: ExplanationParams
): Promise<ExplanationResponse> {
  const baseUrl = API_BASE?.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const url = `${baseUrl}/api/explain`;

  console.log('=== Explanation Request ===');
  console.log('URL:', url);
  console.log('Params:', JSON.stringify(params, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    console.log('Response Status:', response.status);

    const responseText = await response.text();
    console.log('Response Text:', responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed Data:', data);
    } catch {
      console.error('JSON Parse Error');
      console.error('Response was:', responseText);
      throw new Error(
        `Server returned invalid response (not JSON). Status: ${response.status}`
      );
    }

    if (!response.ok) {
      console.error('Request failed:', data);
      throw new Error(
        data.error || `Request failed with status ${response.status}`
      );
    }

    console.log('=== Explanation Success ===');
    return data as ExplanationResponse;
  } catch (error) {
    console.error('=== Explanation Error ===');
    console.error(error);
    throw error;
  }
}
