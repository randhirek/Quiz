/**
 * Google Apps Script to Remove Required Validation from All Form Questions
 * 
 * This script removes the "required to answer" feature from all questions in a Google Form,
 * making all questions optional for respondents.
 * 
 * Author: Manus AI Assistant
 * Version: 1.0
 * Last Updated: 2025-01-06
 */

/**
 * Main function to remove required validation from all form questions
 * Can be used with the current active form or a specific form by ID
 */
function removeAllRequiredQuestions() {
  try {
    // Get the active form (the one currently being edited)
    const form = FormApp.getActiveForm();
    
    if (!form) {
      throw new Error('No active form found. Please open a Google Form first.');
    }
    
    // Process the form
    const result = processFormQuestions(form);
    
    // Log results
    Logger.log(`Successfully processed form: "${form.getTitle()}"`);
    Logger.log(`Total items processed: ${result.totalItems}`);
    Logger.log(`Questions made optional: ${result.questionsModified}`);
    Logger.log(`Items skipped (non-questions): ${result.itemsSkipped}`);
    
    // Show success message to user
    const ui = FormApp.getUi ? FormApp.getUi() : null;
    if (ui) {
      ui.alert(
        'Success!',
        `All questions in "${form.getTitle()}" have been made optional.\n\n` +
        `• Total items: ${result.totalItems}\n` +
        `• Questions modified: ${result.questionsModified}\n` +
        `• Items skipped: ${result.itemsSkipped}`,
        ui.ButtonSet.OK
      );
    }
    
    return result;
    
  } catch (error) {
    Logger.log(`Error: ${error.message}`);
    
    const ui = FormApp.getUi ? FormApp.getUi() : null;
    if (ui) {
      ui.alert('Error', `Failed to process form: ${error.message}`, ui.ButtonSet.OK);
    }
    
    throw error;
  }
}

/**
 * Alternative function to process a specific form by ID
 * @param {string} formId - The ID of the Google Form to process
 */
function removeRequiredQuestionsById(formId) {
  try {
    if (!formId) {
      throw new Error('Form ID is required');
    }
    
    // Get the form by ID
    const form = FormApp.openById(formId);
    
    if (!form) {
      throw new Error(`Form with ID "${formId}" not found or not accessible`);
    }
    
    // Process the form
    const result = processFormQuestions(form);
    
    // Log results
    Logger.log(`Successfully processed form: "${form.getTitle()}" (ID: ${formId})`);
    Logger.log(`Total items processed: ${result.totalItems}`);
    Logger.log(`Questions made optional: ${result.questionsModified}`);
    Logger.log(`Items skipped (non-questions): ${result.itemsSkipped}`);
    
    return result;
    
  } catch (error) {
    Logger.log(`Error processing form ID ${formId}: ${error.message}`);
    throw error;
  }
}

/**
 * Core function that processes all items in a form and removes required validation
 * @param {GoogleAppsScript.Forms.Form} form - The Google Form to process
 * @returns {Object} Processing results with counts
 */
function processFormQuestions(form) {
  const items = form.getItems();
  let questionsModified = 0;
  let itemsSkipped = 0;
  
  items.forEach((item, index) => {
    try {
      const itemType = item.getType();
      let wasModified = false;
      
      // Process different question types
      switch (itemType) {
        case FormApp.ItemType.MULTIPLE_CHOICE:
          const mcItem = item.asMultipleChoiceItem();
          if (mcItem.isRequired()) {
            mcItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.CHECKBOX:
          const cbItem = item.asCheckboxItem();
          if (cbItem.isRequired()) {
            cbItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.TEXT:
          const textItem = item.asTextItem();
          if (textItem.isRequired()) {
            textItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.PARAGRAPH_TEXT:
          const paragraphItem = item.asParagraphTextItem();
          if (paragraphItem.isRequired()) {
            paragraphItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.LIST:
          const listItem = item.asListItem();
          if (listItem.isRequired()) {
            listItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.SCALE:
          const scaleItem = item.asScaleItem();
          if (scaleItem.isRequired()) {
            scaleItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.GRID:
          const gridItem = item.asGridItem();
          if (gridItem.isRequired()) {
            gridItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.CHECKBOX_GRID:
          const checkboxGridItem = item.asCheckboxGridItem();
          if (checkboxGridItem.isRequired()) {
            checkboxGridItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.DATE:
          const dateItem = item.asDateItem();
          if (dateItem.isRequired()) {
            dateItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.DATETIME:
          const datetimeItem = item.asDateTimeItem();
          if (datetimeItem.isRequired()) {
            datetimeItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.TIME:
          const timeItem = item.asTimeItem();
          if (timeItem.isRequired()) {
            timeItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        case FormApp.ItemType.FILE_UPLOAD:
          const fileItem = item.asFileUploadItem();
          if (fileItem.isRequired()) {
            fileItem.setRequired(false);
            wasModified = true;
          }
          break;
          
        // Non-question items (skip these)
        case FormApp.ItemType.SECTION_HEADER:
        case FormApp.ItemType.PAGE_BREAK:
        case FormApp.ItemType.IMAGE:
        case FormApp.ItemType.VIDEO:
          itemsSkipped++;
          Logger.log(`Skipped ${itemType} at index ${index}: "${item.getTitle()}"`);
          break;
          
        default:
          itemsSkipped++;
          Logger.log(`Unknown item type ${itemType} at index ${index}: "${item.getTitle()}"`);
          break;
      }
      
      if (wasModified) {
        questionsModified++;
        Logger.log(`Made optional: ${itemType} - "${item.getTitle()}"`);
      }
      
    } catch (itemError) {
      Logger.log(`Error processing item at index ${index}: ${itemError.message}`);
      itemsSkipped++;
    }
  });
  
  return {
    totalItems: items.length,
    questionsModified: questionsModified,
    itemsSkipped: itemsSkipped
  };
}

/**
 * Utility function to get form information
 * @param {string} formId - Optional form ID, uses active form if not provided
 */
function getFormInfo(formId = null) {
  try {
    const form = formId ? FormApp.openById(formId) : FormApp.getActiveForm();
    
    if (!form) {
      throw new Error('No form found');
    }
    
    const items = form.getItems();
    const requiredCount = items.filter(item => {
      try {
        // Check if item has isRequired method and is required
        return item.isRequired && item.isRequired();
      } catch (e) {
        return false;
      }
    }).length;
    
    const info = {
      title: form.getTitle(),
      description: form.getDescription(),
      id: form.getId(),
      totalItems: items.length,
      requiredQuestions: requiredCount,
      editUrl: form.getEditUrl(),
      publishedUrl: form.getPublishedUrl()
    };
    
    Logger.log('Form Information:');
    Logger.log(JSON.stringify(info, null, 2));
    
    return info;
    
  } catch (error) {
    Logger.log(`Error getting form info: ${error.message}`);
    throw error;
  }
}

/**
 * Batch processing function for multiple forms
 * @param {string[]} formIds - Array of form IDs to process
 */
function removeRequiredQuestionsFromMultipleForms(formIds) {
  const results = [];
  
  formIds.forEach((formId, index) => {
    try {
      Logger.log(`Processing form ${index + 1} of ${formIds.length}: ${formId}`);
      const result = removeRequiredQuestionsById(formId);
      results.push({
        formId: formId,
        success: true,
        result: result
      });
    } catch (error) {
      Logger.log(`Failed to process form ${formId}: ${error.message}`);
      results.push({
        formId: formId,
        success: false,
        error: error.message
      });
    }
  });
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  Logger.log(`Batch processing complete: ${successful} successful, ${failed} failed`);
  
  return results;
}

/**
 * Test function to verify the script works correctly
 */
function testScript() {
  try {
    Logger.log('Testing script...');
    
    // Get form info first
    const info = getFormInfo();
    Logger.log(`Found form: "${info.title}" with ${info.requiredQuestions} required questions`);
    
    if (info.requiredQuestions === 0) {
      Logger.log('No required questions found. Creating a test question...');
      
      // Add a test question to verify the script works
      const form = FormApp.getActiveForm();
      const testItem = form.addTextItem();
      testItem.setTitle('Test Question (will be made optional)');
      testItem.setRequired(true);
      
      Logger.log('Test question added. Running script...');
    }
    
    // Run the main function
    const result = removeAllRequiredQuestions();
    
    Logger.log('Test completed successfully!');
    return result;
    
  } catch (error) {
    Logger.log(`Test failed: ${error.message}`);
    throw error;
  }
}

