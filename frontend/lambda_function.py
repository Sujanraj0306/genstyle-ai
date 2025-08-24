import json
import boto3
import os
import google.generativeai as genai

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('ClothingItems')
api_key = os.environ.get('GOOGLE_AI_API_KEY')
if not api_key:
    raise ValueError("Google AI API Key not found in environment variables")
genai.configure(api_key=api_key)

def lambda_handler(event, context):
    print("--- LAMBDA EXECUTION STARTED ---")
    try:
        # Step 1: Fetch items from DynamoDB
        print("DEBUG: Step 1 - Fetching items from DynamoDB...")
        response = table.scan()
        items = response.get('Items', [])
        print(f"DEBUG: Found {len(items)} items in the wardrobe.")

        if not items:
            print("DEBUG: No items found, returning empty list.")
            return {
                'statusCode': 200,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([])
            }

        # Step 2: Prepare the prompt
        print("DEBUG: Step 2 - Preparing prompt for Gemini...")
        prompt_parts = [
            "You are a virtual fashion stylist.",
            "Analyze the following clothing items from a user's wardrobe. Each item has a unique 'itemId'.",
            "Create the 3 best outfit combinations. An outfit must consist of one top and one bottom.",
            "Return your answer ONLY as a valid JSON array of objects. Each object must have three keys: 'top_item_id' (string), 'bottom_item_id' (string), and 'suggestion' (string).",
            "Do not include any other text, markdown, or explanations outside of the JSON array.",
            "Here are the items:"
        ]
        for item in items:
            s3_uri = f"s3://genstyle-wardrobe-images/{item['itemId']}"
            prompt_parts.extend([f"itemId: {item['itemId']}", genai.Part.from_uri(s3_uri, mime_type="image/jpeg")])
        print("DEBUG: Prompt prepared successfully.")

        # Step 3: Call the Gemini API
        print("DEBUG: Step 3 - Calling the Gemini API...")
        model = genai.GenerativeModel('gemini-pro-vision')
        response = model.generate_content(prompt_parts)
        print("DEBUG: Gemini API call successful.")
        # This next line is very important for debugging!
        print("DEBUG: Raw response text from Gemini:", response.text)

        # Step 4: Parse the JSON response
        print("DEBUG: Step 4 - Parsing the JSON response...")
        json_response_text = response.text.replace("```json", "").replace("```", "").strip()
        outfits = json.loads(json_response_text)
        print("DEBUG: JSON parsing successful.")

        # Step 5: Return the successful response
        print("DEBUG: Step 5 - Returning successful response.")
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            'body': json.dumps(outfits)
        }

    except Exception as e:
        # This will print the exact error to the logs
        print(f"[ERROR] Function failed: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            'body': json.dumps({'error': f"An error occurred: {str(e)}"})
        }