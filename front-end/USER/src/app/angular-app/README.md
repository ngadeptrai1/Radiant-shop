# Angular Payment Application

This project is an Angular application that facilitates online payments. It includes features for managing user addresses, processing payments, and displaying confirmation modals.

## Project Structure

```
angular-app
├── src
│   ├── app
│   │   ├── components
│   │   │   ├── payment
│   │   │   │   ├── payment.component.ts
│   │   │   │   ├── payment.component.html
│   │   │   │   ├── payment.component.css
│   │   │   ├── confirmation-modal
│   │   │   │   ├── confirmation-modal.component.ts
│   │   │   │   ├── confirmation-modal.component.html
│   │   │   │   ├── confirmation-modal.component.css
│   │   ├── services
│   │   │   ├── modal.service.ts
│   ├── app.module.ts
├── angular.json
├── package.json
└── README.md
```

## Features

- **Payment Component**: Handles the payment form, user addresses, and order submission.
- **Confirmation Modal**: Displays a confirmation message before placing an order.
- **Modal Service**: Manages the state of modals throughout the application.

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd angular-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Run the application:
   ```
   ng serve
   ```
5. Open your browser and navigate to `http://localhost:4200`.

## Usage Guidelines

- Users can fill out the payment form and select saved addresses.
- Upon submission, a confirmation modal will appear to confirm the order.
- The application validates the form and checks product availability before processing the order.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.