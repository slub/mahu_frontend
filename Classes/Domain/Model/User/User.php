<?php
namespace Slub\MahuFrontend\Domain\Model\User;

class User extends \In2code\Femanager\Domain\Model\User {
    
    /**
     * The users expertise in the company
     *
     * @var string
     */
    protected $expertise = "";
    
    /**
     * The users position in the company
     *
     * @var string
     */
    protected $position = "";
    
    /**
     * the data delivering user has the power of disposition
     *
     * @var bool
     */
    protected $powerOfDisposition = false;
    
    /**
     * the datetime the user confirmed his/her power of disposition
     *
     * @var \DateTime
     */
    protected $powerOfDispositionDateOfAcceptance = null;
    
    /**
     * Returns, whether the user has accepted terms and conditions
     *
     * @return bool
     */
    public function isPowerOfDisposition(): bool
    {
        return $this->powerOfDisposition;
    }
    
    /**
     * Set whether the user has confirmed his/her power of disposition
     *
     * @param bool $powerOfDisposition
     * @return User
     */
    public function setPowerOfDisposition(bool $powerOfDisposition)
    {
        $this->powerOfDisposition = $powerOfDisposition;
        $this->setPowerOfDispositionDateOfAcceptance();
        return $this;
    }
    
    /**
     * @return \DateTime
     */
    public function getPowerOfDispositionDateOfAcceptance()
    {
        return $this->powerOfDispositionDateOfAcceptance;
    }
    
    /**
     * set terms date to now if it's not set yet
     *
     * @return User
     */
    protected function setPowerOfDispositionDateOfAcceptance()
    {
        if ($this->powerOfDispositionDateOfAcceptance === null) {
            $now = new \DateTime();
            $this->powerOfDispositionDateOfAcceptance = $now;
        }
        return $this;
    }
    
    /**
     * Sets the expertise
     *
     * @param string $expertise
     */
    public function setExpertise($expertise)
    {
        $this->expertise = $expertise;
    }
    
    /**
     * Returns the expertise
     *
     * @return string
     */
    public function getExpertise()
    {
        return $this->expertise;
    }
    
    /**
     * Sets the position
     *
     * @param string $position
     */
    public function setPosition($position)
    {
        $this->position = $position;
    }
    
    /**
     * Returns the position
     *
     * @return string
     */
    public function getPosition()
    {
        return $this->position;
    }
}