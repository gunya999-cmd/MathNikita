import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
};

export function Button({ children, onClick, type = 'button', variant = 'primary' }: ButtonProps) {
  return (
    <button className={variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={onClick} type={type}>
      {children}
    </button>
  );
}
