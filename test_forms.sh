#!/bin/bash

# Base URL for your API
BASE_URL="http://localhost:8000/api"

echo "=== Form API Testing ==="

# 1. Create a new form
echo "1. Creating a new form..."
curl -X POST "$BASE_URL/forms" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Survey Form",
    "title": "A sample survey form for testing",
    "fields": [
      {
        "type": "text",
        "name": "full_name",
        "label": "Full Name",
        "required": true,
        "placeholder": "Enter your full name"
      },
      {
        "type": "email",
        "name": "email",
        "label": "Email Address",
        "required": true,
        "placeholder": "Enter your email"
      },
      {
        "type": "select",
        "name": "department",
        "label": "Department",
        "required": true,
        "options": ["Engineering", "Marketing", "Sales", "HR"]
      },
      {
        "type": "textarea",
        "name": "feedback",
        "label": "Feedback",
        "required": false,
        "placeholder": "Share your thoughts..."
      },
      {
        "type": "checkbox",
        "name": "subscribe",
        "label": "Subscribe to newsletter",
        "required": false
      }
    ],
  }'

echo -e "\n\n"

# 2. Get all forms
echo "2. Getting all forms..."
curl -X GET "$BASE_URL/forms" \
  -H "Content-Type: application/json"

echo -e "\n\n"

# 3. Get form by ID (assuming ID 1 exists)
echo "3. Getting form by ID (1)..."
curl -X GET "$BASE_URL/forms/1" \
  -H "Content-Type: application/json"

echo -e "\n\n"

# 4. Get form by name
echo "4. Getting form by name..."
curl -X GET "$BASE_URL/forms/name/Sample%20Survey%20Form" \
  -H "Content-Type: application/json"

echo -e "\n\n"

# 5. Update a form
echo "5. Updating form..."
curl -X PUT "$BASE_URL/forms/1" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated sample survey form for testing",
    "size": "large"
  }'

echo -e "\n\n"

# 6. Create another form for testing
echo "6. Creating another form..."
curl -X POST "$BASE_URL/forms" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contact Form",
    "title": "Simple contact form",
    "fields": [
      {
        "type": "text",
        "name": "name",
        "label": "Name",
        "required": true
      },
      {
        "type": "email",
        "name": "email",
        "label": "Email",
        "required": true
      },
      {
        "type": "textarea",
        "name": "message",
        "label": "Message",
        "required": true
      }
    ],
    "size": "small"
  }'

echo -e "\n\n"

# 7. Duplicate a form
echo "7. Duplicating form..."
curl -X POST "$BASE_URL/forms/1/duplicate" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "new_name=Survey Form Copy"

echo -e "\n\n"

# 8. Lock a form
echo "8. Locking form..."
curl -X PUT "$BASE_URL/forms/1/lock" \
  -H "Content-Type: application/json"

echo -e "\n\n"

# 9. Try to update locked form (should show it's locked)
echo "9. Trying to update locked form..."
curl -X PUT "$BASE_URL/forms/1" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "This should not work if form is locked"
  }'

echo -e "\n\n"

# 10. Unlock the form
echo "10. Unlocking form..."
curl -X PUT "$BASE_URL/forms/1/unlock" \
  -H "Content-Type: application/json"

echo -e "\n\n"

# 11. Export form configuration
echo "11. Exporting form configuration..."
curl -X GET "$BASE_URL/forms/1/export" \
  -H "Content-Type: application/json" \
  -o "exported_form.json"

echo "Form exported to exported_form.json"
echo -e "\n"

# 12. Import form configuration (you'll need the exported file)
echo "12. Importing form configuration..."
curl -X POST "$BASE_URL/forms/import" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@exported_form.json"

echo -e "\n\n"

# 13. Delete a form (be careful with this!)
echo "13. Deleting form (ID 2)..."
curl -X DELETE "$BASE_URL/forms/2" \
  -H "Content-Type: application/json"

echo -e "\n\n"

echo "=== Testing Complete ==="

# Additional examples for different field types

echo -e "\n=== Advanced Form Examples ==="

# Create a complex form with various field types
echo "Creating a complex registration form..."
curl -X POST "$BASE_URL/forms" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Event Registration",
    "description": "Complete event registration form",
    "fields": [
      {
        "type": "text",
        "name": "first_name",
        "label": "First Name",
        "required": true,
        "validation": {
          "minLength": 2,
          "maxLength": 50
        }
      },
      {
        "type": "text",
        "name": "last_name",
        "label": "Last Name",
        "required": true,
        "validation": {
          "minLength": 2,
          "maxLength": 50
        }
      },
      {
        "type": "email",
        "name": "email",
        "label": "Email Address",
        "required": true,
        "validation": {
          "pattern": "^[^@]+@[^@]+\\.[^@]+$"
        }
      },
      {
        "type": "tel",
        "name": "phone",
        "label": "Phone Number",
        "required": false,
        "placeholder": "+1 (555) 123-4567"
      },
      {
        "type": "date",
        "name": "birth_date",
        "label": "Date of Birth",
        "required": false
      },
      {
        "type": "select",
        "name": "ticket_type",
        "label": "Ticket Type",
        "required": true,
        "options": [
          {"value": "standard", "label": "Standard - $50"},
          {"value": "premium", "label": "Premium - $100"},
          {"value": "vip", "label": "VIP - $200"}
        ]
      },
      {
        "type": "radio",
        "name": "dietary_restrictions",
        "label": "Dietary Restrictions",
        "required": false,
        "options": [
          {"value": "none", "label": "None"},
          {"value": "vegetarian", "label": "Vegetarian"},
          {"value": "vegan", "label": "Vegan"},
          {"value": "gluten_free", "label": "Gluten Free"},
          {"value": "other", "label": "Other"}
        ]
      },
      {
        "type": "checkbox",
        "name": "workshop_sessions",
        "label": "Workshop Sessions",
        "required": false,
        "options": [
          {"value": "morning", "label": "Morning Session (9 AM - 12 PM)"},
          {"value": "afternoon", "label": "Afternoon Session (1 PM - 4 PM)"},
          {"value": "evening", "label": "Evening Session (5 PM - 8 PM)"}
        ]
      },
      {
        "type": "textarea",
        "name": "special_requirements",
        "label": "Special Requirements",
        "required": false,
        "placeholder": "Any special accommodations needed?",
        "validation": {
          "maxLength": 500
        }
      },
      {
        "type": "number",
        "name": "guests",
        "label": "Number of Guests",
        "required": false,
        "validation": {
          "min": 0,
          "max": 5
        }
      },
      {
        "type": "checkbox",
        "name": "terms_agreement",
        "label": "I agree to the terms and conditions",
        "required": true
      },
      {
        "type": "checkbox",
        "name": "marketing_consent",
        "label": "I consent to receive marketing communications",
        "required": false
      }
    ],
  }'

echo -e "\n\nAdvanced form created!"

# Error testing examples
echo -e "\n=== Error Testing ==="

# Try to create form with duplicate name
echo "Testing duplicate name error..."
curl -X POST "$BASE_URL/forms" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sample Survey Form",
    "description": "This should fail",
    "fields": []
  }'

echo -e "\n\n"

# Try to get non-existent form
echo "Testing non-existent form..."
curl -X GET "$BASE_URL/forms/999" \
  -H "Content-Type: application/json"

echo -e "\n\nTesting complete!"