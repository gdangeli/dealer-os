# Lead Timeline E2E Tests

## Overview
Comprehensive end-to-end tests for the Lead Activity Timeline feature.

## Test Coverage

### 1. Component Visibility (`Lead Timeline - Component Visibility`)
- ✓ Timeline component displays on lead detail page
- ✓ Vertical timeline structure with connector line
- ✓ Quick input field for adding activities

### 2. Activity Types (`Lead Timeline - Activity Types`)
- ✓ Activity type dropdown available
- ✓ Supports: Note, Call, Email, Status Change, System Event

### 3. Add Activity (`Lead Timeline - Add Activity`)
- ✓ Add new note activity
- ✓ Add new call activity
- ✓ Clear input after successful submission
- ✓ Prevent empty activity submission
- ✓ Form validation

### 4. Display & Formatting (`Lead Timeline - Display & Formatting`)
- ✓ Activities displayed in chronological order (newest first)
- ✓ Timestamp for each activity
- ✓ Icon for each activity type
- ✓ Activity content/message visible

### 5. Follow-up Reminders (`Lead Timeline - Follow-up Reminders`)
- ✓ Option to set follow-up reminder (optional feature)
- ✓ Date picker for reminder

### 6. Error Handling (`Lead Timeline - Error Handling`)
- ✓ Graceful handling of network errors
- ✓ Maintain input on submission failure
- ✓ Display error messages

### 7. Performance (`Lead Timeline - Performance`)
- ✓ Timeline loads within reasonable time (<5s)
- ✓ Handles large number of activities

## Running the Tests

### Prerequisites
```bash
# Set environment variables
export TEST_USER_EMAIL="your-test-user@example.com"
export TEST_USER_PASSWORD="your-password"
```

### Run All Timeline Tests
```bash
cd /home/ubuntu/dealer-os
npx playwright test e2e/lead-timeline.spec.ts
```

### Run Specific Test Group
```bash
# Component visibility tests only
npx playwright test e2e/lead-timeline.spec.ts -g "Component Visibility"

# Activity creation tests only
npx playwright test e2e/lead-timeline.spec.ts -g "Add Activity"

# Display tests only
npx playwright test e2e/lead-timeline.spec.ts -g "Display & Formatting"
```

### Run with UI
```bash
npx playwright test e2e/lead-timeline.spec.ts --ui
```

### Debug Mode
```bash
npx playwright test e2e/lead-timeline.spec.ts --debug
```

## Test Data Requirements

### Database Setup
The tests require:
1. At least one test user account (credentials in env vars)
2. At least one lead record associated with the test dealer
3. Database table `lead_activities` with schema:
   ```sql
   CREATE TABLE lead_activities (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
     dealer_id UUID REFERENCES dealers(id) ON DELETE CASCADE,
     type VARCHAR(50) NOT NULL, -- 'note', 'call', 'email', 'status_change', 'system_event'
     content TEXT NOT NULL,
     created_at TIMESTAMP DEFAULT NOW(),
     created_by UUID REFERENCES auth.users(id),
     reminder_at TIMESTAMP NULL
   );
   
   CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
   CREATE INDEX idx_lead_activities_dealer_id ON lead_activities(dealer_id);
   CREATE INDEX idx_lead_activities_created_at ON lead_activities(created_at DESC);
   ```

## Test Selectors

The tests use flexible selectors with fallbacks:

### Primary (data-testid)
- `[data-testid="lead-timeline"]` - Main timeline container
- `[data-testid="timeline-line"]` - Vertical connector line
- `[data-testid="activity-input"]` - Input field for new activities
- `[data-testid="activity-type-select"]` - Activity type dropdown
- `[data-testid="add-activity-button"]` - Submit button
- `[data-testid="timeline-item"]` - Individual timeline entry
- `[data-testid="activity-timestamp"]` - Activity timestamp
- `[data-testid="activity-icon"]` - Activity type icon
- `[data-testid="activity-content"]` - Activity content/message
- `[data-testid="error-message"]` - Error message display

### Fallback Selectors
Tests include semantic fallbacks for flexibility during development.

## Expected Behavior

### Activity Ordering
- Activities are displayed newest-first (descending chronological order)
- Each activity shows: Icon | Timestamp | Content

### Activity Types
1. **Note** (Notiz) - General text notes
2. **Call** (Anruf) - Phone call logs
3. **Email** (E-Mail) - Email correspondence
4. **Status Change** (Status-Änderung) - Lead status updates
5. **System Event** (System-Event) - Automated events

### Validation
- Empty activities cannot be submitted
- Form should be disabled or show validation message

### Error Handling
- Network errors display user-friendly message
- Input persists on submission failure
- User can retry after error

## Integration with CI/CD

These tests are designed to run in CI environments:
- Retries enabled (2 retries in CI)
- Screenshots on failure
- HTML report generated
- Sequential execution for stability

## Maintenance Notes

### When to Update Tests
- New activity types added
- UI changes to timeline component
- Changes to lead detail page structure
- API endpoint changes

### Common Issues
1. **No leads available**: Tests skip if no test leads exist
2. **Authentication failure**: Check TEST_USER_EMAIL/PASSWORD env vars
3. **Selector changes**: Update primary selectors if component structure changes
4. **Timing issues**: Adjust timeouts if necessary (default: 30s)

## Future Enhancements
- [ ] Test activity editing
- [ ] Test activity deletion
- [ ] Test activity filtering by type
- [ ] Test activity search
- [ ] Test pagination for many activities
- [ ] Test real-time updates (if implemented)
- [ ] Test reminder notifications
