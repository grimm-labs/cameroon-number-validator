# cameroon-number-validator

A lightweight, zero-dependency library to validate Cameroonian phone numbers, identify carriers (MTN, Orange, Camtel, Nexttel, Yoomee), and format to E.164.

Works in Node.js, browsers (via bundler), and any TypeScript/JavaScript project.

## Installation

Install directly from GitHub:

```bash
# Using npm
npm install github:grimm/cameroon-number-validator

# Using yarn
yarn add github:grimm/cameroon-number-validator

# Using pnpm
pnpm add github:grimm/cameroon-number-validator
```

You can also pin a specific branch, tag, or commit:

```bash
# Specific branch
npm install github:grimm/cameroon-number-validator#main

# Specific tag
npm install github:grimm/cameroon-number-validator#v1.0.0

# Specific commit
npm install github:grimm/cameroon-number-validator#abc1234
```

## Usage

### Validate a phone number

```typescript
import { validateCameroonPhone } from 'cameroon-number-validator';

const result = validateCameroonPhone('+237 6 50 12 34 56');
console.log(result);
// {
//   isValid: true,
//   carrier: 'MTN_CM',
//   type: 'MOBILE',
//   localNumber: '650123456',
//   e164: '+237650123456',
//   display: '+237 650 12 34 56'
// }
```

### Check the carrier

```typescript
import { isCarrier } from 'cameroon-number-validator';

isCarrier('690000000', 'ORANGE_CM'); // true
isCarrier('650000000', 'ORANGE_CM'); // false
```

### Check if it's a mobile number

```typescript
import { isMobile } from 'cameroon-number-validator';

isMobile('670123456'); // true
isMobile('222123456'); // false (landline)
```

### Convert to E.164

```typescript
import { toE164 } from 'cameroon-number-validator';

toE164('6 50 12 34 56');   // '+237650123456'
toE164('invalid');          // null
```

### Get the local number (9 digits)

```typescript
import { toLocalNumber } from 'cameroon-number-validator';

toLocalNumber('+237650123456'); // '650123456'
```

### Batch validation

```typescript
import { validateBatch } from 'cameroon-number-validator';

const result = validateBatch(['650123456', '690000000', 'invalid']);
console.log(result.summary);
// {
//   total: 3,
//   validCount: 2,
//   invalidCount: 1,
//   byCarrier: { MTN_CM: 1, ORANGE_CM: 1, CAMTEL_CM: 0, ... }
// }
```

## API

| Function | Description | Returns |
|---|---|---|
| `validateCameroonPhone(phone)` | Full validation of a phone number | `CameroonPhoneValidationResult` |
| `isCarrier(phone, carrier)` | Check if the number belongs to a carrier | `boolean` |
| `isMobile(phone)` | Check if it's a mobile number | `boolean` |
| `toE164(phone)` | Convert to E.164 format | `string \| null` |
| `toLocalNumber(phone)` | Extract the 9-digit local number | `string \| null` |
| `validateBatch(phones)` | Validate an array of phone numbers | `BatchValidationResult` |
| `toCarrierType(carrier)` | Map a carrier to its type string | `string \| null` |

## Exported Types

```typescript
type CameroonCarrier = 'MTN_CM' | 'ORANGE_CM' | 'CAMTEL_CM' | 'NEXTTEL_CM' | 'YOOMEE_CM' | 'FIXE_CM' | 'UNKNOWN_CM';
type PhoneNumberType = 'MOBILE' | 'LANDLINE' | 'UNKNOWN';
type PhoneValidationError = 'EMPTY' | 'TOO_SHORT' | 'TOO_LONG' | 'INVALID_CHARS' | 'UNKNOWN_PREFIX';

interface CameroonPhoneValidationResult {
  isValid: boolean;
  carrier: CameroonCarrier;
  type: PhoneNumberType;
  localNumber?: string;
  e164?: string;
  display?: string;
  errorCode?: PhoneValidationError;
  errorMessage?: string;
}
```

## Supported Carriers

| Carrier | Prefixes |
|---|---|
| MTN | 650-654, 670-689 |
| Orange | 655-659, 690-699 |
| Nexttel | 660-669 |
| Yoomee | 624 |
| Camtel (Mobile) | 620-623, 625-629 |
| Camtel (Landline) | 222, 223, 227, 229, 232, 233, 242-244 |

## Accepted Input Formats

The library accepts various input formats:

- `650123456` — local number
- `+237650123456` — E.164
- `237650123456` — with country code, no +
- `00237650123456` — international format
- `6 50 12 34 56` — with spaces
- `(650) 12-34-56` — with parentheses and dashes

## License

MIT
