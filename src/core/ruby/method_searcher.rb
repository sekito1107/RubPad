require 'json'

module MethodSearcher
  def self.run(class_name)
    begin
      klass = Object.const_get(class_name)
      ignored = ['Object', 'Kernel', 'BasicObject']

      methods = klass.instance_methods(true).map do |m|
        owner_name = klass.instance_method(m).owner.to_s
        
        # Override owner for documentation links
        doc_owner = owner_name
        [Enumerable, Comparable].each do |mod|
          if klass < mod && mod.instance_methods.include?(m)
            doc_owner = mod.name
            break
          end
        end

        { name: m.to_s, owner: owner_name, doc_owner: doc_owner }
      end

      methods.reject! { |m| ignored.include?(m[:owner]) }
      methods.sort_by! { |m| m[:name] }
      
      # We just need name and doc_owner for the UI
      result = methods.map { |m| { name: m[:name], owner: m[:doc_owner] } }

      JSON.generate(result)
    rescue NameError, TypeError
      JSON.generate([])
    end
  end
end
