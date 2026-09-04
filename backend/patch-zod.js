const fs = require('fs');
let code = fs.readFileSync('src/routes/goal.routes.ts', 'utf8');

const oldCode = `    const parsed = JSON.parse(response.text || '{}');
    const suggestions = parsed.suggestions || [];
    
    res.status(200).json({
      status: 'success',
      data: suggestions
    });
  } catch (error: any) {
    console.error('Error generating goal suggestions:', error);
    res.status(500).json({ error: true, message: error.message || 'Failed to generate suggestions' });
  }`;

const newCode = `    const parsed = JSON.parse(response.text || '{}');
    const suggestions = parsed.suggestions || [];
    
    const validSuggestions = suggestions.filter((s: any) => {
      const result = createGoalSchema.shape.body.safeParse(s);
      if (!result.success) {
        console.warn('Invalid AI suggestion:', result.error.message);
        return false;
      }
      return true;
    });

    if (validSuggestions.length !== 3) {
      console.warn(\`AI returned \${validSuggestions.length} valid suggestions instead of 3.\`);
    }

    res.status(200).json({
      status: 'success',
      data: validSuggestions.slice(0, 3)
    });
  } catch (error: any) {
    console.error('Error generating goal suggestions:', error.message || error);
    res.status(500).json({ error: true, message: error.message || 'Failed to generate suggestions' });
  }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/routes/goal.routes.ts', code);
console.log('Patched');
