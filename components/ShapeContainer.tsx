interface ShapeContainerProps {
  children?: React.ReactNode
}

const ShapeContainer = ({ children }: ShapeContainerProps) => {
  return (
    <div className="h-full flex flex-col md:shadow-shape md:bg-fuchsia-200 md:mx-auto md:w-[450px] md:rounded-16 md:p-32">
      {children}
    </div>
  )
}

export default ShapeContainer
