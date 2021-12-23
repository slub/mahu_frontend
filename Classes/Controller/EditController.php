<?php
namespace Slub\MahuFrontend\Controller;

class EditController extends \In2code\Femanager\Controller\EditController
{

    /**
     * @return void
     */
    public function initializeUpdateAction()
    {
        if ($this->arguments->hasArgument('user')) {
            // Workaround to avoid php7 warnings of wrong type hint.
            /** @var \Slub\MahuFrontend\Xclass\Extbase\Mvc\Controller\Argument $user */
            $user = $this->arguments['user'];
            $user->setDataType(\Slub\MahuFrontend\Domain\Model\User\User::class);
        }
    }
    
    /**
     * action update
     *
     * @param \Slub\MahuFrontend\Domain\Model\User\User $user
     * @TYPO3\CMS\Extbase\Annotation\Validate("In2code\Femanager\Domain\Validator\ServersideValidator", param="user")
     * @TYPO3\CMS\Extbase\Annotation\Validate("In2code\Femanager\Domain\Validator\PasswordValidator", param="user")
     * @return void
     */
    public function updateAction(\In2code\Femanager\Domain\Model\User $user)
    {
        parent::updateAction($user);
    }
}